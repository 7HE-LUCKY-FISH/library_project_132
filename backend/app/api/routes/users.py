from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import CurrentIdentity, DBSession, require_role
from ...schemas import BookResponse, UserDashboard
from ...services import book_service, user_service

# This is where all the user APIs live and what they use


router = APIRouter(prefix="/user", tags=["user"])
UserIdentity = Annotated[CurrentIdentity, Depends(require_role("user"))]


@router.get("/dashboard", response_model=UserDashboard)
def dashboard(identity: UserIdentity, db: DBSession) -> UserDashboard:
    try:
        return user_service.get_user_dashboard(db, identity.user_id)
    except user_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/books", response_model=list[BookResponse])
def books(_: UserIdentity, db: DBSession) -> list[BookResponse]:
    return book_service.list_books(db)
