from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import CurrentIdentity, DBSession, require_role
from ...schemas import (
    AdminDashboard,
    LibrarianCreate,
    LibrarianResponse,
    LibrarianUpdate,
    MessageResponse,
    UserResponse,
)
from ...services import admin_service


# This is setting the primary API backend to for admin. They have roles seperate from the rest of the user and librarians

router = APIRouter(prefix="/admin", tags=["admin"])
AdminIdentity = Annotated[CurrentIdentity, Depends(require_role("admin"))]


@router.get("/dashboard", response_model=AdminDashboard)
def dashboard(_: AdminIdentity, db: DBSession) -> AdminDashboard:
    return admin_service.get_dashboard(db)


@router.get("/users", response_model=list[UserResponse])
def users(_: AdminIdentity, db: DBSession) -> list[UserResponse]:
    return admin_service.list_users(db)


@router.patch("/users/{user_id}/approve", response_model=UserResponse)
def approve_user(user_id: int, _: AdminIdentity, db: DBSession) -> UserResponse:
    try:
        return admin_service.approve_user(db, user_id)
    except admin_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: int, _: AdminIdentity, db: DBSession) -> MessageResponse:
    try:
        admin_service.delete_user(db, user_id)
    except admin_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MessageResponse(message="User deleted successfully")


@router.get("/librarians", response_model=list[LibrarianResponse])
def librarians(_: AdminIdentity, db: DBSession) -> list[LibrarianResponse]:
    return admin_service.list_librarians(db)


@router.post("/librarians", response_model=LibrarianResponse, status_code=status.HTTP_201_CREATED)
def create_librarian(payload: LibrarianCreate, _: AdminIdentity, db: DBSession) -> LibrarianResponse:
    try:
        return admin_service.create_librarian(db, payload)
    except admin_service.ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/librarians/{librarian_id}", response_model=LibrarianResponse)
def update_librarian(
    librarian_id: int,
    payload: LibrarianUpdate,
    _: AdminIdentity,
    db: DBSession,
) -> LibrarianResponse:
    try:
        return admin_service.update_librarian(db, librarian_id, payload)
    except admin_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except admin_service.ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/librarians/{librarian_id}", response_model=MessageResponse)
def delete_librarian(librarian_id: int, _: AdminIdentity, db: DBSession) -> MessageResponse:
    try:
        admin_service.delete_librarian(db, librarian_id)
    except admin_service.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MessageResponse(message="Librarian deleted successfully")
