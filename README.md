# MockPilot

An adaptive AI-powered mock interview platform that personalizes question 
difficulty and topic focus across sessions based on per-user skill state.

## What it does

Most mock interview tools are static quiz banks. MockPilot is different — 
it learns how you perform across 19 topics over multiple sessions and adapts 
every interview to target your specific weaknesses while maintaining your 
strengths.

- **Adaptive question selection** via Thompson sampling with rolling 5-session 
  Beta windows, weighted by per-topic knowledge gap and inconsistency
- **Per-topic skill tracking** — knowledge and confidence updated after every 
  answer via EMA, persisted across sessions
- **Dynamic question generation** — Groq/Llama generates fresh questions every 
  session calibrated to your current skill level, never repeating
- **Semantic answer evaluation** — MiniLM scores answers via cosine similarity 
  + key concept coverage; Groq verification only for ambiguous scores
- **Resume-aware interviews** — upload your resume and get questions about your 
  actual projects, architecture choices, and technical decisions
- **Communication tracking** — fluency, structure, and composure tracked 
  independently from technical scores
- **Voice-first** — speak your answers, Web Speech API transcribes in real time

## How it works

### 1. Session Start
Before the interview begins, MockPilot reads your persistent skill state —
knowledge, confidence, and variance for each topic built from all your past sessions.

### 2. Topic Selection
Thompson sampling draws from a rolling 5-session Beta distribution per topic,
combined with topic urgency and role-specific weights to pick what to ask next:

- **Knowledge gap** (60% weight) — how weak are you on this topic?
- **Inconsistency** (40% weight) — how variable are your scores?
- **Unseen bonus** — topics with fewer attempts surface more often
- **Role weights** — ML/DS and SDE-1 have different topic priorities

### 3. Question Generation
The selected topic, your current knowledge level, and your resume are sent to
Groq/Llama, which generates:
- A calibrated question at the right difficulty
- 3 ideal answer variants
- 5 key concepts the answer should cover

Questions are never repeated — generated fresh every session.

### 4. You Answer
45 seconds to think. 2 minutes to speak. Web Speech API transcribes your
answer in real time.

### 5. Answer Evaluation
MiniLM scores your answer on two dimensions:
- **Semantic similarity** — how close is your answer to the ideal? (0.6 weight)
- **Concept coverage** — how many of the 5 key concepts did you hit? (0.4 weight)

If the score falls in an ambiguous range (0.35–0.65), Groq verifies.

### 6. Skill State Update
Your score updates knowledge and confidence for that topic immediately:
- Knowledge shifts via EMA (α = 0.3) — recent answers matter more
- Variance tracked → confidence = 1 - sqrt(variance)
- Beta window updated for next session's Thompson sampling

### 7. Session Report
After all 7 questions, MockPilot generates a deterministic report showing:
- Per-topic knowledge and confidence with session trend
- Key concepts you missed
- Communication score (fluency, structure, composure)
- Focus areas for your next session

## Roles & Topics

**ML/DS Role (11 topics)**
ML Fundamentals · Algorithm Internals · Deep Learning · Stats & Probability · 
Evaluation Metrics · SQL · Python & Pandas · ML Case Studies · MLOps Basics · 
Big Data Basics · OS · DBMS · OOP · System Design · Computer Networks

**SDE-1 Role (8 topics)**
DS & Algorithms · OS · DBMS · Computer Networks · OOP · System Design · 
SQL · API Design

*Cross-role topics (SQL, OS, DBMS, OOP, System Design, CN) appear in both 
with role-specific weights.*

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS (Vercel) |
| Backend | FastAPI (Render) |
| Database | Supabase Postgres + pgvector |
| Auth | Supabase Auth |
| LLM | Groq / Llama 3.1 8B |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Transcription | Web Speech API |

## Status

🚧 Actively building — V1 in progress

- [x] System architecture finalized
- [x] Topic taxonomy and sample question bank designed
- [X] Supabase schema + data loading
- [x] Groq question generation pipeline
- [x] MiniLM evaluation pipeline
- [x] Thompson sampling + session flow
- [ ] Resume parsing (PyMuPDF)
- [ ] Frontend — auth, dashboard, interview UI
- [ ] End to end V1 complete

## Local Setup

```bash
# Backend
cd backend
conda activate mock-interview
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

*Full setup guide coming soon.*
