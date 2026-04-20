from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import CurrentIdentity, DBSession, require_role
from ...schemas import BookCreate, BookResponse, BookUpdate, LibrarianDashboard, MessageResponse
from ...services import book_service

router = APIRouter(prefix="/librarian", tags=["librarian"])
LibrarianIdentity = Annotated[CurrentIdentity, Depends(require_role("librarian"))]


@router.get("/dashboard", response_model=LibrarianDashboard)
def dashboard(_: LibrarianIdentity, db: DBSession) -> LibrarianDashboard:
    return book_service.get_librarian_dashboard(db)


@router.get("/books", response_model=list[BookResponse])
def books(_: LibrarianIdentity, db: DBSession) -> list[BookResponse]:
    return book_service.list_books(db)


@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(payload: BookCreate, identity: LibrarianIdentity, db: DBSession) -> BookResponse:
    try:
        return book_service.create_book(db, payload, librarian_id=identity.user_id)
    except book_service.ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/books/{book_id}", response_model=BookResponse)
def update_book(book_id: int, payload: BookUpdate, _: LibrarianIdentity, db: DBSession) -> BookResponse:
    try:
        return book_service.update_book(db, book_id, payload)
    except book_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except book_service.ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/books/{book_id}", response_model=MessageResponse)
def delete_book(book_id: int, _: LibrarianIdentity, db: DBSession) -> MessageResponse:
    try:
        book_service.delete_book(db, book_id)
    except book_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MessageResponse(message="Book deleted successfully")
