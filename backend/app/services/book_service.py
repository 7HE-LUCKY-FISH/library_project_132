from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Book, Librarian
from ..schemas.book import BookCreate, BookUpdate
from ..schemas.librarian import LibrarianDashboard


class ConflictError(Exception):
    pass


class NotFoundError(Exception):
    pass


def list_books(db: Session) -> list[Book]:
    return list(db.scalars(select(Book).order_by(Book.created_at.desc(), Book.id.desc())).all())


def create_book(db: Session, payload: BookCreate, librarian_id: int | None = None) -> Book:
    duplicate = db.scalar(select(Book).where(Book.title == payload.title))
    if duplicate:
        raise ConflictError("A book with that title already exists")

    book = Book(
        title=payload.title,
        genre=payload.genre,
        image_url=payload.image_url,
        created_by_librarian_id=librarian_id,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update_book(db: Session, book_id: int, payload: BookUpdate) -> Book:
    book = db.get(Book, book_id)
    if not book:
        raise NotFoundError("Book not found")

    duplicate = db.scalar(select(Book).where(Book.title == payload.title, Book.id != book_id))
    if duplicate:
        raise ConflictError("Another book already uses that title")

    book.title = payload.title
    book.genre = payload.genre
    book.image_url = payload.image_url
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: int) -> None:
    book = db.get(Book, book_id)
    if not book:
        raise NotFoundError("Book not found")
    db.delete(book)
    db.commit()


def get_librarian_dashboard(db: Session) -> LibrarianDashboard:
    total_books = db.scalar(select(func.count()).select_from(Book)) or 0
    active_librarians = db.scalar(
        select(func.count()).select_from(Librarian).where(Librarian.is_active.is_(True))
    ) or 0
    return LibrarianDashboard(total_books=total_books, active_librarians=active_librarians)
