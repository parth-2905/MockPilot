# MockPilot

An adaptive AI-powered mock interview platform that personalizes question
difficulty and topic focus across sessions based on per-user skill state.

🔗 **Live:** https://mockpilot.vercel.app
⚙️ **API:** mockpilot-tnme.onrender.com

<img width="1279" height="697" alt="image" src="https://github.com/user-attachments/assets/a1d33fc0-85c2-4062-99bb-61623da95385" />


## What it does

Most mock interview tools are static quiz banks. MockPilot is different —
it learns how you perform across topics over multiple sessions and adapts
every interview to target your specific weaknesses while maintaining your
strengths.

- **Adaptive question selection** via Thompson sampling with rolling
  Beta-distribution windows, weighted by per-topic knowledge gap and
  inconsistency
- **Per-topic skill tracking** — knowledge and confidence updated after every
  answer via EMA (α = 0.3), persisted across sessions in Supabase
- **Confidence-weighted difficulty** — question difficulty blends knowledge
  and confidence (`0.7 × knowledge + 0.3 × confidence`), so an accurate-but-
  hesitant answer is calibrated differently from a confidently wrong one
- **Dynamic question generation** — Llama 3.1 8B on Groq's LPU engine
  generates a fresh question every session calibrated to your current skill
  level, never repeating
- **Semantic answer evaluation** — MiniLM-L6-v2 scores answers via cosine
  similarity + key concept coverage; Groq verification for ambiguous scores
- **Resume-aware interviews** — upload your resume and get questions about
  your actual projects, architecture choices, and technical decisions
- **Communication tracking** — fluency, structure, and composure tracked
  independently from technical scores
- **Voice-first** — speak your answers, Web Speech API transcribes in real
  time under live interview timing (45s to think, 2 min to answer)

  <img width="1279" height="694" alt="image" src="https://github.com/user-attachments/assets/721c7796-1514-4f07-9a62-cb1a0e485a39" />


## How it works

### 1. Session Start
Before the interview begins, MockPilot reads your persistent skill state —
knowledge, confidence, and variance for each topic, built from all your past
sessions.

### 2. Topic Selection
Thompson sampling draws from a rolling Beta distribution per topic, combined
with topic urgency and role-specific weights to pick what to ask next:

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

<img width="1279" height="697" alt="image" src="https://github.com/user-attachments/assets/8f92352d-f48c-4897-88c3-31124a372c4f" />


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
After all questions, MockPilot generates a deterministic report showing:
- Per-topic knowledge and confidence with session trend
- Key concepts you missed
- Communication score (fluency, structure, composure)
- Focus areas for your next session


## Dashboard

Persistent skill state across sessions, visualized per topic.
<img width="1279" height="695" alt="image" src="https://github.com/user-attachments/assets/a5e68664-cf7b-4f1e-8997-324293e3c45d" />


## Roles & Topics

<!-- NOTE: counts below don't reconcile — ML/DS header says 11 but lists 15
     items, and the two role lists only sum to 17 unique topics, not the 19
     referenced elsewhere. Update this section with the real current topic
     list before publishing. -->

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
| Frontend | React + Vite, Tailwind CSS, Framer Motion, GSAP, Lenis (Vercel) |
| Backend | FastAPI (Render) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (Google OAuth + email/password) |
| LLM | Groq / Llama 3.1 8B |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) via HuggingFace Inference API |
| Resume Parsing | PyMuPDF |
| Transcription | Web Speech API |
| Charts | Chart.js (react-chartjs-2) |

## Status

🚀 **V1 live** — core loop complete, hardening in progress


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
