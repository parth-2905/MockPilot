"""
app/routers/sessions.py

Session management endpoints for MockPilot.

Flow:
  POST /sessions/start   → upload resume, Thompson selects 5 topics,
                           resume parsing starts in background,
                           returns session_id + Q1
  POST /sessions/submit  → score answer, update EMA, return next question
                           (or report if session complete)
  GET  /sessions/report/{session_id} → full session summary
"""

import uuid
import json
import base64
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.db.supabase import supabase
from app.services.thompson import select_topics
from app.services.groq_service import generate_question
from app.services.minilm_service import evaluate_and_update
from app.services.resume_service import parse_resume, generate_resume_questions
from app.models.schemas import (
    SessionStartRequest,
    SessionStartResponse,
    SessionSubmitRequest,
    SessionSubmitResponse,
    SessionReportResponse
)

router = APIRouter()

QUESTIONS_PER_SESSION = 7   # 5 topic + 2 resume
TOPIC_QUESTIONS       = 5
RESUME_QUESTIONS      = 2


# ---------------------------------------------------------------------------
# Difficulty from knowledge
# ---------------------------------------------------------------------------

def _get_difficulty(knowledge: float, confidence: float = 0.5) -> str:
    """
    Derive question difficulty from user's effective score for a topic.

    effective_score = 0.7 * knowledge + 0.3 * confidence

    effective_score < 0.4  → easy   (struggling, build confidence)
    0.4 ≤ s < 0.7          → medium (basics covered, push deeper)
    s ≥ 0.7                 → hard   (strong, challenge them)
    New users default to knowledge=0.5, confidence=0.5 → effective_score=0.5 → medium.
    """
    effective_score = 0.7 * knowledge + 0.3 * confidence

    if effective_score < 0.4:
        return "easy"
    elif effective_score < 0.7:
        return "medium"
    else:
        return "hard"


# ---------------------------------------------------------------------------
# Background task: parse resume + generate resume questions
# ---------------------------------------------------------------------------

def _prepare_resume_questions(session_id: str, pdf_bytes: bytes, user_id: str, role: str):
    """
    Runs in background while user answers Thompson topic questions.
    Parses resume, generates 2 targeted questions, stores in session row.
    Expected to complete well within the time taken to answer 5 questions.
    """
    try:
        resume_text      = parse_resume(pdf_bytes)
        resume_questions = generate_resume_questions(resume_text, user_id, role)

        supabase.table("sessions").update({
            "resume_questions": json.dumps(resume_questions),
            "resume_text":      resume_text
        }).eq("id", session_id).execute()

    except Exception as e:
        print(f"[resume background task] failed for session {session_id}: {e}")
        supabase.table("sessions").update({
            "resume_questions": json.dumps([])
        }).eq("id", session_id).execute()


# ---------------------------------------------------------------------------
# Helper: generate next Thompson question
# ---------------------------------------------------------------------------

def _generate_topic_question(topic: dict, role: str, user_id: str) -> dict:
    """
    Generate a question for the given topic via Groq.
    Difficulty is derived dynamically from user's knowledge for this topic.
    """
    # Fetch user's current knowledge for this topic
    res = (
        supabase.table("user_topic_state")
        .select("knowledge, confidence")
        .eq("user_id", user_id)
        .eq("topic_id", topic["topic_id"])
        .execute()
    )
    knowledge  = res.data[0]["knowledge"]  if res.data else 0.5
    confidence = res.data[0]["confidence"] if res.data else 0.5
    difficulty = _get_difficulty(knowledge, confidence)

    result = generate_question(
        topic_name=topic["topic_name"],
        topic_id=topic["topic_id"],
        difficulty=difficulty,
        role=role
    )
    return {
        "topic_id":      topic["topic_id"],
        "topic_name":    topic["topic_name"],
        "question":      result["question"],
        "ideal_answers": result["ideal_answers"],
        "key_concepts":  result["key_concepts"],
        "is_resume":     False,
        "difficulty":    difficulty
    }


# ---------------------------------------------------------------------------
# POST /sessions/start
# ---------------------------------------------------------------------------

@router.post("/start", response_model=SessionStartResponse)
def start_session(req: SessionStartRequest, background_tasks: BackgroundTasks):
    """
    Start a new interview session.
    - Thompson selects 5 topics
    - Resume parsing kicks off in background
    - Returns session_id + first question immediately
    """
    # 1. Thompson topic selection
    topic_queue = select_topics(req.user_id, req.role, n=TOPIC_QUESTIONS)

    # 2. Generate Q1 immediately (difficulty based on user knowledge)
    first_question = _generate_topic_question(topic_queue[0], req.role, req.user_id)

    # 3. Create session row in Supabase
    session_id = str(uuid.uuid4())
    supabase.table("sessions").insert({
        "id":               session_id,
        "user_id":          req.user_id,
        "role":             req.role,
        "status":           "active",
        "topic_queue":      json.dumps(topic_queue),
        "current_index":    0,
        "answers":          json.dumps([]),
        "resume_questions": json.dumps([]),
        "resume_text":      ""
    }).execute()

    # 4. Kick off resume parsing in background
    pdf_bytes = base64.b64decode(req.resume_b64)
    background_tasks.add_task(
        _prepare_resume_questions,
        session_id,
        pdf_bytes,
        req.user_id,
        req.role
    )

    return SessionStartResponse(
        session_id=session_id,
        question_number=1,
        total_questions=QUESTIONS_PER_SESSION,
        topic_id=first_question["topic_id"],
        topic_name=first_question["topic_name"],
        question=first_question["question"],
        ideal_answers=first_question["ideal_answers"],
        key_concepts=first_question["key_concepts"],
        is_resume=False,
        difficulty=first_question["difficulty"]
    )


# ---------------------------------------------------------------------------
# POST /sessions/submit
# ---------------------------------------------------------------------------

@router.post("/submit", response_model=SessionSubmitResponse)
def submit_answer(req: SessionSubmitRequest):
    """
    Submit answer for current question.
    - Scores answer + updates EMA state
    - Stores answer in session
    - Returns next question, or completion flag if session done
    """
    # 1. Fetch session
    res = supabase.table("sessions").select("*").eq("id", req.session_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session       = res.data[0]
    current_index = session["current_index"]
    topic_queue   = json.loads(session["topic_queue"])
    answers       = json.loads(session["answers"])
    role          = session["role"]
    user_id       = session["user_id"]

    if session["status"] == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")

    # 2. Score the answer
    eval_result = evaluate_and_update(
        user_id       = user_id,
        topic_id      = req.topic_id,
        question      = req.question,
        user_answer   = req.user_answer,
        ideal_answers = req.ideal_answers,
        key_concepts  = req.key_concepts
    )

    # 3. Store answer
    answers.append({
        "question_number": current_index + 1,
        "topic_id":        req.topic_id,
        "topic_name":      req.topic_name,
        "question":        req.question,
        "ideal_answers":   req.ideal_answers,
        "key_concepts":    req.key_concepts,
        "user_answer":     req.user_answer,
        "is_resume":       req.is_resume,
        "difficulty":      req.difficulty,
        "cosine":          eval_result["scores"]["cosine"],
        "coverage":        eval_result["scores"]["coverage"],
        "final":           eval_result["scores"]["final"],
        "groq_verified":   eval_result["scores"]["groq_verified"]
    })

    next_index = current_index + 1

    # 4. Check if session complete
    if next_index >= QUESTIONS_PER_SESSION:
        supabase.table("sessions").update({
            "current_index": next_index,
            "answers":       json.dumps(answers),
            "status":        "completed",
            "completed_at":  datetime.utcnow().isoformat()
        }).eq("id", req.session_id).execute()

        return SessionSubmitResponse(
            session_complete=True,
            score=eval_result["scores"],
            state=eval_result["state"],
            next_question=None
        )

    # 5. Generate next question
    if next_index < TOPIC_QUESTIONS:
        # Still in Thompson topic questions — difficulty auto-derived from knowledge
        next_topic  = topic_queue[next_index]
        next_q_data = _generate_topic_question(next_topic, role, user_id)
        is_resume   = False

    else:
        # Resume questions (index 5 and 6)
        resume_questions = json.loads(session["resume_questions"])
        resume_idx       = next_index - TOPIC_QUESTIONS  # 0 or 1

        if not resume_questions or resume_idx >= len(resume_questions):
            raise HTTPException(
                status_code=503,
                detail="Resume questions not ready yet. Please wait a moment and retry."
            )

        rq = resume_questions[resume_idx]
        next_q_data = {
            "topic_id":      -1,
            "topic_name":    "Resume",
            "question":      rq["question"],
            "ideal_answers": rq["ideal_answers"],
            "key_concepts":  rq["key_concepts"],
            "is_resume":     True,
            "difficulty":    "N/A"  # resume questions don't have a difficulty level
        }
        is_resume = True

    # 6. Update session
    supabase.table("sessions").update({
        "current_index": next_index,
        "answers":       json.dumps(answers)
    }).eq("id", req.session_id).execute()

    return SessionSubmitResponse(
        session_complete=False,
        score=eval_result["scores"],
        state=eval_result["state"],
        next_question={
            "question_number": next_index + 1,
            "total_questions": QUESTIONS_PER_SESSION,
            "topic_id":        next_q_data["topic_id"],
            "topic_name":      next_q_data["topic_name"],
            "question":        next_q_data["question"],
            "ideal_answers":   next_q_data["ideal_answers"],
            "key_concepts":    next_q_data["key_concepts"],
            "is_resume":       is_resume,
            "difficulty":      next_q_data["difficulty"]
        }
    )


# ---------------------------------------------------------------------------
# GET /sessions/report/{session_id}
# ---------------------------------------------------------------------------

@router.get("/report/{session_id}", response_model=SessionReportResponse)
def get_report(session_id: str):
    """
    Return full session report.
    - Per-question scores
    - Overall session score (average of all finals)
    """
    res = supabase.table("sessions").select("*").eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = res.data[0]
    if session["status"] != "completed":
        raise HTTPException(status_code=400, detail="Session not completed yet")

    answers = json.loads(session["answers"])

    overall_score = round(
        sum(a["final"] for a in answers) / len(answers), 4
    ) if answers else 0.0

    return SessionReportResponse(
        session_id=session_id,
        user_id=session["user_id"],
        role=session["role"],
        started_at=session["started_at"],
        completed_at=session["completed_at"],
        overall_score=overall_score,
        answers=answers
    )
