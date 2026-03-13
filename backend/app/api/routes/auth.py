from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, SignUpRequest, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = create_user(db, request.email, request.password)
    return AuthResponse(
        access_token=create_access_token(user),
        user=UserResponse(id=str(user.id), email=user.email),
    )


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        access_token=create_access_token(user),
        user=UserResponse(id=str(user.id), email=user.email),
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=str(current_user.id), email=current_user.email)
