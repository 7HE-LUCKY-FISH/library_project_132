from fastapi import APIRouter

from ..deps import DBSession
from ...schemas import BookResponse
from ...services import book_service

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookResponse])
def list_public_books(db: DBSession) -> list[BookResponse]:
    return book_service.list_books(db)
