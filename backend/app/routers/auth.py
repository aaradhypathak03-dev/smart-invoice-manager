from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, UserOut
from app.services.auth_deps import get_current_user
from app.services.phone import normalize_phone
from app.services.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)

    existing = db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail={"code": "PHONE_ALREADY_REGISTERED", "message": "This phone number is already registered"},
        )

    user = User(name=payload.name, phone=phone, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    user = db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()

    invalid_credentials = HTTPException(status_code=401, detail="Invalid phone number or password")
    if not user or not verify_password(payload.password, user.password_hash):
        raise invalid_credentials

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
