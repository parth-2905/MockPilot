from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from app.db.supabase import supabase, SUPABASE_URL

router = APIRouter()

class UserAuth(BaseModel):
    email: str
    password: str

class GoogleLoginPayload(BaseModel):
    access_token: str

@router.post("/signup")
def signup(auth: UserAuth):
    try:
        response = supabase.auth.sign_up({
            "email": auth.email,
            "password": auth.password
        })
        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Signup failed."
            )
        return {"status": "ok", "user": {"id": response.user.id, "email": response.user.email}}
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'message'):
            err_msg = e.message
        raise HTTPException(
            status_code=400,
            detail=err_msg
        )

@router.post("/login")
def login(auth: UserAuth):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": auth.email,
            "password": auth.password
        })
        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Login failed."
            )
        return {
            "status": "ok",
            "access_token": response.session.access_token if response.session else "",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'message'):
            err_msg = e.message
        raise HTTPException(
            status_code=400,
            detail=err_msg
        )

@router.get("/oauth/google")
def oauth_google(redirect_to: str):
    try:
        # Construct the official Supabase Google OAuth authorize URL
        supabase_oauth_url = f"{SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to={redirect_to}"
        return RedirectResponse(url=supabase_oauth_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate Google OAuth URL: {str(e)}"
        )

@router.post("/login/google")
def login_google(payload: GoogleLoginPayload):
    try:
        # Fetch the user profile from Supabase using the access token
        user_response = supabase.auth.get_user(payload.access_token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired Google OAuth session token."
            )
        user = user_response.user
        return {
            "status": "ok",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'message'):
            err_msg = e.message
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {err_msg}"
        )
