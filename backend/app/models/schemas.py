"""
app/models/schemas.py
Pydantic request/response models for MockPilot API.
"""

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

class QuestionRequest(BaseModel):
    topic_name: str
    difficulty: str   # "easy" | "medium" | "hard"
    role: str         # "ml_ds" | "sde_1"


class QuestionResponse(BaseModel):
    question:     str
    ideal_answers: list[str]   # 3 distinct phrasings
    key_concepts:  list[str]   # 3-7 key concepts, shared across all ideal answers


# ---------------------------------------------------------------------------
# Answers / Evaluation
# ---------------------------------------------------------------------------

class EvaluateRequest(BaseModel):
    user_id:       str
    topic_id:      int
    question:      str
    user_answer:   str
    ideal_answers: list[str]   # 3 ideal answers from question generation
    key_concepts:  list[str]   # shared key concepts for this question


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
