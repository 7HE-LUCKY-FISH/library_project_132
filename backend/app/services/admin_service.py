from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.security import hash_password
from ..models import Book, Librarian, User
from ..schemas.admin import AdminDashboard
from ..schemas.librarian import LibrarianCreate, LibrarianUpdate


class ConflictError(Exception):
    pass


class NotFoundError(Exception):
    pass


def get_dashboard(db: Session) -> AdminDashboard:
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    approved_users = db.scalar(select(func.count()).select_from(User).where(User.is_approved.is_(True))) or 0
    pending_users = total_users - approved_users
    total_librarians = db.scalar(select(func.count()).select_from(Librarian)) or 0
    total_books = db.scalar(select(func.count()).select_from(Book)) or 0

    return AdminDashboard(
        total_users=total_users,
        approved_users=approved_users,
        pending_users=pending_users,
        total_librarians=total_librarians,
        total_books=total_books,
    )


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc(), User.id.desc())).all())


def approve_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    user.is_approved = True
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> None:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    db.delete(user)
    db.commit()


def list_librarians(db: Session) -> list[Librarian]:
    return list(db.scalars(select(Librarian).order_by(Librarian.created_at.desc(), Librarian.id.desc())).all())


def create_librarian(db: Session, payload: LibrarianCreate) -> Librarian:
    existing = db.scalar(select(Librarian).where(Librarian.email == payload.email))
    if existing:
        raise ConflictError("A librarian with that email already exists")

    librarian = Librarian(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        position=payload.position,
        password_hash=hash_password(payload.password),
        is_active=payload.is_active,
    )
    db.add(librarian)
    db.commit()
    db.refresh(librarian)
    return librarian


def update_librarian(db: Session, librarian_id: int, payload: LibrarianUpdate) -> Librarian:
    librarian = db.get(Librarian, librarian_id)
    if not librarian:
        raise NotFoundError("Librarian not found")

    duplicate = db.scalar(
        select(Librarian).where(Librarian.email == payload.email, Librarian.id != librarian_id)
    )
    if duplicate:
        raise ConflictError("Another librarian already uses that email")

    librarian.first_name = payload.first_name
    librarian.last_name = payload.last_name
    librarian.email = payload.email
    librarian.position = payload.position
    librarian.is_active = payload.is_active
    if payload.password:
        librarian.password_hash = hash_password(payload.password)

    db.add(librarian)
    db.commit()
    db.refresh(librarian)
    return librarian


def delete_librarian(db: Session, librarian_id: int) -> None:
    librarian = db.get(Librarian, librarian_id)
    if not librarian:
        raise NotFoundError("Librarian not found")
    db.delete(librarian)
    db.commit()
