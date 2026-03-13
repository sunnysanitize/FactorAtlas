import base64
import hashlib
import hmac
import json
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

TOKEN_TTL_HOURS = 24 * 30
PBKDF2_ITERATIONS = 600_000


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"{PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        iterations_str, salt_b64, digest_b64 = password_hash.split("$", 2)
        iterations = int(iterations_str)
        salt = _b64decode(salt_b64)
        expected = _b64decode(digest_b64)
    except (ValueError, TypeError):
        return False

    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected)


def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": int((datetime.now(UTC) + timedelta(hours=TOKEN_TTL_HOURS)).timestamp()),
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = _b64encode(payload_json)
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return f"{payload_b64}.{_b64encode(signature)}"


def decode_access_token(token: str) -> dict | None:
    try:
        payload_b64, signature_b64 = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    actual_signature = _b64decode(signature_b64)
    if not hmac.compare_digest(expected_signature, actual_signature):
        return None

    try:
        payload = json.loads(_b64decode(payload_b64))
    except json.JSONDecodeError:
        return None

    if payload.get("exp", 0) < int(datetime.now(UTC).timestamp()):
        return None
    return payload


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    try:
        parsed = uuid.UUID(user_id)
    except ValueError:
        return None
    return db.query(User).filter(User.id == parsed).first()


def create_user(db: Session, email: str, password: str) -> User:
    user = User(email=email.lower(), password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
