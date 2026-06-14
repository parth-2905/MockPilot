"""
main.py
FastAPI entrypoint for MockPilot backend.
Run: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MockPilot API")

# Allow frontend (Vite dev server + future deployed frontend) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before deploying to prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "MockPilot API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


from app.routers import questions

app.include_router(questions.router, prefix="/questions", tags=["questions"])

# Routers to be added as they're built:
# from app.routers import sessions, evaluation, users
# app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
# app.include_router(evaluation.router, prefix="/evaluation", tags=["evaluation"])
# app.include_router(users.router, prefix="/users", tags=["users"])
