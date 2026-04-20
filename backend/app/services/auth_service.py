from typing import Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.security import create_access_token, verify_password
from ..models import Admin, Librarian, User
from ..schemas.auth import TokenResponse


def _make_token(display_name: str, role: str, subject: str) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(subject=subject, role=role),
        role=role,
        display_name=display_name,
    )


def authenticate_admin(db: Session, identifier: str, password: str) -> TokenResponse | None:
    admin = db.scalar(select(Admin).where(Admin.username == identifier))
    if not admin or not verify_password(password, admin.password_hash):
        return None
    return _make_token(display_name=admin.username, role="admin", subject=f"admin:{admin.id}")


def authenticate_librarian(db: Session, identifier: str, password: str) -> TokenResponse | None:
    librarian = db.scalar(select(Librarian).where(Librarian.email == identifier))
    if not librarian or not verify_password(password, librarian.password_hash) or not librarian.is_active:
        return None
    display_name = f"{librarian.first_name} {librarian.last_name}".strip()
    return _make_token(display_name=display_name, role="librarian", subject=f"librarian:{librarian.id}")


def authenticate_user(db: Session, identifier: str, password: str) -> Tuple[TokenResponse | None, str | None]:
    user = db.scalar(select(User).where(User.email == identifier))
    if not user or not verify_password(password, user.password_hash):
        return None, "Invalid email or password."
    if not user.is_approved:
        return None, "Your account is waiting for admin approval."
    display_name = f"{user.first_name} {user.last_name}".strip()
    return _make_token(display_name=display_name, role="user", subject=f"user:{user.id}"), None
