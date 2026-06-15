"""
app/routers/answers.py
Endpoint for evaluating a user's interview answer.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluateRequest, EvaluateResponse
from app.services.minilm_service import evaluate_and_update

router = APIRouter()


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate(req: EvaluateRequest):
    try:
        result = evaluate_and_update(
            user_id      = req.user_id,
            topic_id     = req.topic_id,
            question     = req.question,
            user_answer  = req.user_answer,
            ideal_answers= req.ideal_answers,
            key_concepts = req.key_concepts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
