"""
app/services/thompson.py

Topic selection via Thompson sampling.

For each topic:
  1. Fetch user's knowledge + variance from user_topic_state
     (defaults: knowledge=0.5, variance=0.25 for unseen topics)
  2. Compute urgency = 0.6 × (1 - knowledge) + 0.4 × (1 - confidence)
     where confidence = 1 - sqrt(variance)
  3. Apply role weight (ml_ds_weight or sde_weight from topics table)
     weighted_urgency = urgency × role_weight
  4. Sample Beta distribution parameterized by knowledge + variance
  5. Final score = thompson_sample × weighted_urgency
  6. Return top 5 unique topics (no topic repeats within a session)

Why top 5:
  - 7 questions per session = 5 topic questions + 2 resume questions
  - Resume questions are handled separately in the sessions router
"""

import math
import numpy as np
from app.db.supabase import supabase
import random
DSA_TOPIC_NAME = "DSA"

def _beta_params(knowledge: float, variance: float) -> tuple[float, float]:
    """
    Convert EMA knowledge + variance into Beta distribution (alpha, beta) params.
    Uses method of moments:
      alpha = knowledge * (knowledge*(1-knowledge)/variance - 1)
      beta  = (1-knowledge) * (knowledge*(1-knowledge)/variance - 1)
    Clamps to minimum of 0.5 to avoid degenerate distributions.
    """
    # Clamp variance to avoid division by zero or invalid params
    variance = max(variance, 1e-6)
    variance = min(variance, knowledge * (1 - knowledge) - 1e-6) if knowledge * (1 - knowledge) > variance else 0.01

    common = knowledge * (1 - knowledge) / variance - 1
    common = max(common, 0.1)  # ensure positive

    alpha = max(knowledge * common, 0.5)
    beta  = max((1 - knowledge) * common, 0.5)
    return alpha, beta


def select_topics(user_id: str, role: str, n: int = 5) -> list[dict]:
    """
    Select top n topics for this session using Thompson sampling.

    Args:
        user_id: the user's ID
        role:    'ml_ds' or 'sde_1'
        n:       number of topics to select (default 5)

    Returns:
        List of n dicts: [{topic_id, topic_name, score}, ...]
        Ordered by final Thompson score descending.
    """
    # 1. Fetch all topics with role weights
    topics_res = supabase.table("topics").select("id, name, ml_ds_weight, sde_weight").execute()
    topics     = topics_res.data

    # 2. Fetch user's current state for all topics
    state_res = (
        supabase.table("user_topic_state")
        .select("topic_id, knowledge, variance, confidence")
        .eq("user_id", user_id)
        .execute()
    )
    state_map = {row["topic_id"]: row for row in state_res.data}

    weight_col = "ml_ds_weight" if role == "ml_ds" else "sde_weight"

    scored_topics = []

    for topic in topics:
        topic_id    = topic["id"]
        topic_name  = topic["name"]
        role_weight = topic.get(weight_col) or 0.5  # fallback if NULL

        # Skip topics with zero role weight — irrelevant for this role
        if role_weight == 0.0:
            continue

        # Get user state or use defaults for unseen topics
        state      = state_map.get(topic_id, {})
        knowledge  = state.get("knowledge",  0.5)
        variance   = state.get("variance",   0.25)
        confidence = state.get("confidence", 0.5)

        # 3. Urgency: how much does this topic need attention?
        urgency          = 0.6 * (1 - knowledge) + 0.4 * (1 - confidence)
        weighted_urgency = urgency * role_weight

        # 4. Thompson sample from Beta distribution
        alpha, beta = _beta_params(knowledge, variance)
        # We invert the sample because high knowledge = less urgent
        # Sample represents "how much this topic needs work"
        thompson_sample = 1 - np.random.beta(alpha, beta)

        # 5. Final score
        final_score = thompson_sample * weighted_urgency

        scored_topics.append({
            "topic_id":   topic_id,
            "topic_name": topic_name,
            "score":      round(final_score, 6)
        })

    # 6. Sort descending by Thompson score
    scored_topics.sort(key=lambda x: x["score"], reverse=True)
    top_n = scored_topics[:n]

    # 7. Guarantee DSA is included among the n selected topics.
    #    If it didn't naturally make the cut, swap it in for whichever
    #    topic scored lowest (least urgent gets bumped, not a random one).
    dsa_entry = next((t for t in scored_topics if t["topic_name"] == DSA_TOPIC_NAME), None)
    if dsa_entry and dsa_entry not in top_n:
        top_n[-1] = dsa_entry

    # 8. Randomize order. Without this, DSA (and every topic) would always
    #    land at the same question number — predictable score-ranking order
    #    isn't realistic for an interview. Shuffle so position varies each
    #    session while still respecting *which* 5 topics urgency picked.
    random.shuffle(top_n)

    return top_n