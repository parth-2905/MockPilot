"""
app/services/resume_service.py

Resume parsing + targeted question generation.

Flow:
1. Parse PDF bytes → extract text via PyMuPDF
2. Fetch user's weak topics from user_topic_state (lowest knowledge)
3. Send resume text + weak topics to Groq
4. Groq generates 2 targeted questions:
   - If resume mentions weak topics → drill into that experience
   - If no overlap → pick hardest/most technical questions from resume content
5. Questions stored in session row under resume_questions
"""

import json
import fitz  # PyMuPDF
from groq import Groq
from app.db.supabase import supabase
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_MODEL   = "llama-3.1-8b-instant"
client       = Groq(api_key=GROQ_API_KEY)


def parse_resume(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    doc  = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def get_weak_topics(user_id: str, n: int = 5) -> list[dict]:
    """
    Fetch user's n weakest topics from user_topic_state.
    Weak = lowest knowledge score.
    Falls back to empty list if user has no state yet.
    """
    res = (
        supabase.table("user_topic_state")
        .select("topic_id, knowledge")
        .eq("user_id", user_id)
        .order("knowledge", desc=False)
        .limit(n)
        .execute()
    )
    if not res.data:
        return []

    # Fetch topic names
    topic_ids  = [row["topic_id"] for row in res.data]
    topics_res = (
        supabase.table("topics")
        .select("id, name")
        .in_("id", topic_ids)
        .execute()
    )
    name_map = {t["id"]: t["name"] for t in topics_res.data}

    return [
        {
            "topic_id":  row["topic_id"],
            "topic_name": name_map.get(row["topic_id"], "Unknown"),
            "knowledge":  row["knowledge"]
        }
        for row in res.data
    ]


def generate_resume_questions(
    resume_text: str,
    user_id: str,
    role: str
) -> list[dict]:
    """
    Generate 2 targeted resume-based interview questions.

    Strategy:
    - Fetch user's weak topics
    - If resume mentions any weak topics → generate questions drilling
      into that specific experience + weakness
    - If no overlap → generate hardest technical questions from resume content
    - Always technical, never HR fluff

    Returns:
        [
            {"question": str, "ideal_answers": [str, str, str], "key_concepts": [str, ...]},
            {"question": str, "ideal_answers": [str, str, str], "key_concepts": [str, ...]}
        ]
    """
    weak_topics = get_weak_topics(user_id)
    role_label  = "ML/Data Science" if role == "ml_ds" else "Software Engineer (SDE-1)"

    weak_topics_text = (
        "\n".join(f"- {t['topic_name']} (knowledge score: {t['knowledge']:.2f})"
                  for t in weak_topics)
        if weak_topics else "No prior interview data available."
    )

    prompt = f"""You are an expert technical interviewer preparing questions based on a candidate's resume.

Candidate role: {role_label}

Resume:
{resume_text}

Candidate's weak areas based on past interview performance:
{weak_topics_text}

Your task:
Generate exactly 2 technical interview questions based on the resume above.

Priority logic:
1. If the resume mentions any of the weak areas listed above, generate questions that specifically 
   probe the candidate's understanding of those concepts within the context of their actual work/projects.
2. If there is no overlap between resume content and weak areas, generate the 2 most technically 
   challenging and insightful questions you can from the resume content.
3. Never ask generic HR questions. Always technical, always specific to their experience.
4. Questions should be hard enough to differentiate strong candidates from average ones.

Return a JSON array of exactly 2 objects. Each object must follow this EXACT structure:
{{
  "question": "the interview question as a single string",
  "ideal_answers": [
    "a complete plain-text paragraph describing one strong answer approach",
    "a complete plain-text paragraph describing a second strong answer approach",
    "a complete plain-text paragraph describing a third strong answer approach"
  ],
  "key_concepts": ["concept1", "concept2", "concept3"]
}}

CRITICAL: "ideal_answers" must be an array of exactly 3 PLAIN STRINGS (full sentences/paragraphs).
Do NOT use nested objects or dictionaries inside ideal_answers. Each element must be type string only.

JSON only, no markdown:"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert technical interviewer. Respond with ONLY valid JSON, no markdown fences, no preamble."
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
    questions = json.loads(raw)
    if not isinstance(questions, list) or len(questions) != 2:
        raise ValueError("Expected list of 2 questions")

    # Normalize: if ideal_answers contains dicts, flatten them to strings
    for q in questions:
        if not isinstance(q.get("ideal_answers"), list):
            raise ValueError("ideal_answers must be a list")
        normalized = []
        for ans in q["ideal_answers"]:
            if isinstance(ans, dict):
                # Flatten dict values into one string
                normalized.append(" ".join(str(v) for v in ans.values()))
            else:
                normalized.append(str(ans))
        q["ideal_answers"] = normalized

except (json.JSONDecodeError, ValueError) as e:
    raise ValueError(f"Groq returned invalid response: {raw}") from e
