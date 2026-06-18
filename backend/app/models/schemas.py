"""
app/models/schemas.py
Pydantic request/response models for MockPilot API.
"""

from pydantic import BaseModel
from typing import Optional


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

class QuestionRequest(BaseModel):
    topic_name: str
    difficulty: str   # "easy" | "medium" | "hard"
    role: str         # "ml_ds" | "sde_1"


class QuestionResponse(BaseModel):
    question:      str
    ideal_answers: list[str]
    key_concepts:  list[str]


# ---------------------------------------------------------------------------
# Answers / Evaluation
# ---------------------------------------------------------------------------

class EvaluateRequest(BaseModel):
    user_id:       str
    topic_id:      int
    question:      str
    user_answer:   str
    ideal_answers: list[str]
    key_concepts:  list[str]


class ScoreDetail(BaseModel):
    cosine:        float
    coverage:      float
    final:         float
    groq_verified: bool


class StateDetail(BaseModel):
    knowledge:  float
    variance:   float
    confidence: float
    attempts:   int


class EvaluateResponse(BaseModel):
    scores: ScoreDetail
    state:  StateDetail


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------

class SessionStartRequest(BaseModel):
    user_id:    str
    role:       str   # "ml_ds" | "sde_1"
    resume_b64: str   # base64 encoded PDF


class SessionStartResponse(BaseModel):
    session_id:      str
    question_number: int
    total_questions: int
    topic_id:        int
    topic_name:      str
    question:        str
    ideal_answers:   list[str]
    key_concepts:    list[str]
    is_resume:       bool
    difficulty:      str   # "easy" | "medium" | "hard"


class SessionSubmitRequest(BaseModel):
    session_id:    str
    topic_id:      int
    topic_name:    str
    question:      str
    user_answer:   str
    ideal_answers: list[str]
    key_concepts:  list[str]
    is_resume:     bool
    difficulty:    str


class NextQuestion(BaseModel):
    question_number: int
    total_questions: int
    topic_id:        int
    topic_name:      str
    question:        str
    ideal_answers:   list[str]
    key_concepts:    list[str]
    is_resume:       bool
    difficulty:      str


class SessionSubmitResponse(BaseModel):
    session_complete: bool
    score:            ScoreDetail
    state:            Optional[StateDetail] = None
    next_question:    Optional[NextQuestion] = None


class SessionReportResponse(BaseModel):
    session_id:    str
    user_id:       str
    role:          str
    started_at:    str
    completed_at:  Optional[str]
    overall_score: float
    answers:       list[dict]
