import re

from fastapi import HTTPException

INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def normalize_phone(raw: str) -> str:
    """Normalize to E.164-ish '+91XXXXXXXXXX' for a 10-digit Indian mobile number.

    Accepts input with or without '+91'/'91' prefix and strips spaces/dashes.
    """
    digits = re.sub(r"[\s\-()]", "", raw)
    digits = digits.removeprefix("+")
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if not INDIAN_MOBILE_RE.match(digits):
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_PHONE", "message": "Enter a valid 10-digit Indian mobile number"},
        )
    return f"+91{digits}"
