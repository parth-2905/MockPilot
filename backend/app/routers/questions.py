"""
app/routers/questions.py
Endpoints for generating interview questions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.supabase import supabase
from app.services.groq_service import generate_question

router = APIRouter()


class QuestionRequest(BaseModel):
    topic_name: str
    difficulty: str  # "easy" | "medium" | "hard"
    role: str  # "ml_ds" | "sde_1"


@router.post("/generate")
def generate(req: QuestionRequest):
    topic_res = (
        supabase.table("topics").select("id").eq("name", req.topic_name).execute()
    )
    if not topic_res.data:
        raise HTTPException(status_code=404, detail=f"Topic '{req.topic_name}' not found")

    topic_id = topic_res.data[0]["id"]

    try:
        result = generate_question(
            topic_name=req.topic_name,
            topic_id=topic_id,
            difficulty=req.difficulty,
            role=req.role,
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return result


@router.get("/topics")
def list_topics():
    res = supabase.table("topics").select("id, name").execute()
    return res.data
