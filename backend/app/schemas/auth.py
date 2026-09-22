import re

from pydantic import BaseModel, ConfigDict, field_validator


def _validate_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise ValueError("Password must contain at least one letter and one number")
    return password


class RegisterIn(BaseModel):
    name: str
    phone: str
    password: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password(v)


class LoginIn(BaseModel):
    phone: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
