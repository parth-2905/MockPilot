"""
app/services/minilm_service.py

Answer evaluation pipeline using HF Inference API for embeddings.
MiniLM runs on HF's servers — zero RAM cost on Render free tier.

Flow:
- Cosine similarity via HF Inference API (semantic depth)
- Key concept coverage (factual breadth)
- Combined score: 0.6 x cosine + 0.4 x coverage
- Groq verification for ambiguous scores (0.35-0.65)
- EMA state update: knowledge, variance, confidence per user per topic
"""

import os
import math
import time
import numpy as np
import requests
from dotenv import load_dotenv
from groq import Groq
from app.db.supabase import supabase

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "dummy_key")
HF_TOKEN     = os.environ.get("HF_TOKEN", "dummy_token")
GROQ_MODEL   = "llama-3.1-8b-instant"
HF_MODEL_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"

groq_client  = Groq(api_key=GROQ_API_KEY)

AMBIGUOUS_LOW  = 0.35
AMBIGUOUS_HIGH = 0.65
ALPHA          = 0.3   # EMA smoothing factor

import cohere
co = cohere.Client(os.environ.get("COHERE_API_KEY", ""))

def _get_embeddings_cohere(texts: list[str]) -> list[list[float]]:
    response = co.embed(
        texts=texts,
        model="embed-english-light-v3.0",
        input_type="search_document"
    )
    return response.embeddings

# ---------------------------------------------------------------------------
# HF Inference API — embeddings
# ---------------------------------------------------------------------------

def _get_embeddings(texts: list[str]) -> list[list[float]]:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": texts, "options": {"wait_for_model": True}}

    last_err = None
    for attempt in range(3):
        try:
            response = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=30)
            if response.status_code == 503:
                time.sleep(10)
                response = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=30)
            if response.status_code != 200:
                raise ValueError(f"HF API error {response.status_code}: {response.text}")
            return response.json()
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            last_err = e
            time.sleep(2 ** attempt)
    raise ConnectionError(f"HF unreachable after 3 attempts: {last_err}")


def _cosine_sim(a: list[float], b: list[float]) -> float:
    """Cosine similarity between two vectors."""
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def cosine_score(user_answer: str, ideal_answers: list[str]) -> float:
    all_texts = [user_answer] + ideal_answers
    try:
        embeddings = _get_embeddings(all_texts)
    except Exception:
        embeddings = _get_embeddings_cohere(all_texts)
    
    emb_user   = embeddings[0]
    emb_ideals = embeddings[1:]
    scores = [_cosine_sim(emb_user, emb_ideal) for emb_ideal in emb_ideals]
    return round(max(scores), 4)


def concept_coverage(user_answer: str, key_concepts: list[str]) -> float:
    """
    Fraction of key concepts mentioned in the user's answer (case-insensitive substring match).
    key_concepts list length is variable (3-7) depending on question complexity.
    All ideal answers share the same key_concepts list — one ground truth per question.
    """
    answer_lower = user_answer.lower()
    hits = sum(1 for kc in key_concepts if kc.lower() in answer_lower)
    return round(hits / len(key_concepts), 4)


def combined_score(user_answer: str, ideal_answers: list[str], key_concepts: list[str]) -> dict:
    """
    Combined score: 0.6 x cosine + 0.4 x coverage.
    Cosine dominates because semantic understanding matters more than keyword recall.
    """
    cos   = cosine_score(user_answer, ideal_answers)
    cov   = concept_coverage(user_answer, key_concepts)
    final = round(0.6 * cos + 0.4 * cov, 4)
    return {"cosine": cos, "coverage": cov, "final": final}


def evaluate_answer(
    user_answer: str,
    ideal_answers: list[str],
    key_concepts: list[str],
    question: str
) -> dict:
    """
    Full evaluation pipeline.
    - Runs combined_score first.
    - If score is ambiguous (0.35-0.65), calls Groq for a nuanced judgment.
    - Outside ambiguous range, automated score is returned as-is (no API cost).
    """
    scores = combined_score(user_answer, ideal_answers, key_concepts)
    final  = scores["final"]

    if AMBIGUOUS_LOW <= final <= AMBIGUOUS_HIGH:
        formatted_ideals = "\n".join(f"- {a}" for a in ideal_answers)
        prompt = f"""You are evaluating a technical interview answer.

Question: {question}
Ideal answers:
{formatted_ideals}
Key concepts to cover: {', '.join(key_concepts)}
User's answer: {user_answer}

The automated scorer gave a score of {final:.2f} (ambiguous range).
Based on correctness and concept coverage, give a final score between 0.0 and 1.0.
Reply with ONLY a number like: 0.72"""

        resp = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
            temperature=0.0
        )
        try:
            groq_score = float(resp.choices[0].message.content.strip())
            groq_score = max(0.0, min(1.0, groq_score))
        except ValueError:
            groq_score = final

        scores["final"]         = round(groq_score, 4)
        scores["groq_verified"] = True
    else:
        scores["groq_verified"] = False

    return scores


# ---------------------------------------------------------------------------
# EMA state
# ---------------------------------------------------------------------------

def update_ema_state(current: dict, new_score: float) -> dict:
    """
    Update per-user per-topic EMA state after an answer.
    - knowledge:  EMA of scores (alpha=0.3)
    - variance:   EMA of squared deviation from knowledge estimate
    - confidence: 1 - sqrt(variance)
    - attempts:   total answers for this topic
    """
    old_knowledge = current.get("knowledge", 0.5)
    old_variance  = current.get("variance",  0.25)
    old_attempts  = current.get("attempts",  0)

    new_knowledge  = ALPHA * new_score + (1 - ALPHA) * old_knowledge
    new_variance   = ALPHA * (new_score - new_knowledge) ** 2 + (1 - ALPHA) * old_variance
    new_confidence = round(1 - math.sqrt(new_variance), 4)
    new_confidence = max(0.0, min(1.0, new_confidence))

    return {
        "knowledge":  round(new_knowledge, 4),
        "variance":   round(new_variance,  4),
        "confidence": new_confidence,
        "attempts":   old_attempts + 1
    }


def persist_state(user_id: str, topic_id: int, new_state: dict) -> None:
    """Upsert user_topic_state row in Supabase."""
    supabase.table("user_topic_state").upsert({
        "user_id":    user_id,
        "topic_id":   topic_id,
        "knowledge":  new_state["knowledge"],
        "variance":   new_state["variance"],
        "confidence": new_state["confidence"],
        "attempts":   new_state["attempts"]
    }, on_conflict="user_id,topic_id").execute()


def evaluate_and_update(
    user_id: str,
    topic_id: int,
    question: str,
    user_answer: str,
    ideal_answers: list[str],
    key_concepts: list[str]
) -> dict:
    """
    Full pipeline: evaluate answer → fetch state → update EMA → persist.
    Called by the /answers/evaluate endpoint.
    """
    scores = evaluate_answer(user_answer, ideal_answers, key_concepts, question)

    res = (
        supabase.table("user_topic_state")
        .select("*")
        .eq("user_id", user_id)
        .eq("topic_id", topic_id)
        .execute()
    )
    current   = res.data[0] if res.data else {}
    new_state = update_ema_state(current, scores["final"])
    persist_state(user_id, topic_id, new_state)

    return {"scores": scores, "state": new_state}
