"""
app/services/groq_service.py
Generates interview questions dynamically using Groq, calibrated against
sample questions stored in Supabase.

Standalone test: python -m app.services.groq_service
"""

import os
import json
from dotenv import load_dotenv
from groq import Groq

from app.db.supabase import supabase

load_dotenv()

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_MODEL = "llama-3.1-8b-instant"

client = Groq(api_key=GROQ_API_KEY)


def get_sample_questions(topic_id: int, difficulty: str, limit: int = 3) -> list[str]:
    """Fetch calibration examples for a given topic + difficulty."""
    res = (
        supabase.table("sample_questions")
        .select("question_text")
        .eq("topic_id", topic_id)
        .eq("difficulty", difficulty)
        .limit(limit)
        .execute()
    )
    return [row["question_text"] for row in res.data]


def generate_question(topic_name: str, topic_id: int, difficulty: str, role: str) -> dict:
    """
    Generate a new interview question calibrated to the difficulty level
    of the sample questions for this topic.

    Returns:
        {
            "question": str,
            "ideal_answers": [str, str, str],
            "key_concepts": [str, str, str, str, str]
        }
    """
    samples = get_sample_questions(topic_id, difficulty)
    samples_text = "\n".join(f"- {s}" for s in samples) if samples else "(no examples available)"

    role_label = "ML/Data Science" if role == "ml_ds" else "Software Engineer (SDE-1)"

    system_prompt = (
        "You are an expert technical interviewer generating mock interview questions. "
        "Respond with ONLY valid JSON, no markdown fences, no preamble."
    )

    user_prompt = f"""Generate ONE new interview question for a {role_label} candidate.

Topic: {topic_name}
Difficulty: {difficulty}

Here are example questions at this exact difficulty level for this topic — match their style, depth, and scope (do not copy them, generate a new one):
{samples_text}

Return a JSON object with exactly these keys:
- "question": the new interview question (string)
- "ideal_answers": an array of 3 strings, each a distinct strong answer approach/explanation to the question (varying in framing or depth)
- "key_concepts": an array of 5 short strings, each a key concept/term/technique a strong answer should mention

JSON only:"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if the model adds them anyway
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {raw}") from e

    return data


if __name__ == "__main__":
    # Standalone test — adjust topic_id to match what's in your DB
    # (e.g. 1 = DSA, check Supabase table editor for actual ids)
    test_topic_name = "ML Fundamentals"
    test_topic_id = (
        supabase.table("topics").select("id").eq("name", test_topic_name).execute().data[0]["id"]
    )

    result = generate_question(
        topic_name=test_topic_name,
        topic_id=test_topic_id,
        difficulty="medium",
        role="ml_ds",
    )

    print(json.dumps(result, indent=2))
