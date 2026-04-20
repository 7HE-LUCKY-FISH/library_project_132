from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..core.security import hash_password
from ..models import Book, User
from ..schemas.auth import UserSignupRequest
from ..schemas.user import UserDashboard


class ConflictError(Exception):
    pass


class NotFoundError(Exception):
    pass


def signup_user(db: Session, payload: UserSignupRequest) -> User:
    existing = db.scalar(
        select(User).where(or_(User.email == payload.email, User.username == payload.username))
    )
    if existing:
        raise ConflictError("That email or username is already registered")

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        username=payload.username,
        education=payload.education,
        password_hash=hash_password(payload.password),
        is_approved=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_dashboard(db: Session, user_id: int) -> UserDashboard:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    total_books = db.scalar(select(func.count()).select_from(Book)) or 0
    return UserDashboard(profile=user, total_books=total_books)
