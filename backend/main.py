"""
main.py
FastAPI entrypoint for MockPilot backend.
Run: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MockPilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before prod
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


from app.routers import questions, answers, sessions

app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(answers.router,   prefix="/answers",   tags=["answers"])
app.include_router(sessions.router,  prefix="/sessions",  tags=["sessions"])

from app.routers import users
app.include_router(users.router, prefix="/users", tags=["users"])
