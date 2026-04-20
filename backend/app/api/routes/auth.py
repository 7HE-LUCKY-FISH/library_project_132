from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import CurrentIdentity, get_current_identity, get_db
from ...models import Admin, Librarian, User
from ...schemas import AuthenticatedIdentity, LoginRequest, MessageResponse, TokenResponse, UserSignupRequest
from ...services.auth_service import authenticate_admin, authenticate_librarian, authenticate_user
from ...services.user_service import ConflictError, signup_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/admin/login", response_model=TokenResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    token = authenticate_admin(db, payload.identifier, payload.password)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return token


@router.post("/librarian/login", response_model=TokenResponse)
def librarian_login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    token = authenticate_librarian(db, payload.identifier, payload.password)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return token


@router.post("/user/login", response_model=TokenResponse)
def user_login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    token, error = authenticate_user(db, payload.identifier, payload.password)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error or "Invalid email or password")
    return token


@router.post("/user/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def user_signup(payload: UserSignupRequest, db: Session = Depends(get_db)) -> MessageResponse:
    try:
        signup_user(db, payload)
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return MessageResponse(message="Account created. Waiting for admin approval.")


@router.get("/me", response_model=AuthenticatedIdentity)
def me(
    identity: CurrentIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db),
) -> AuthenticatedIdentity:
    if identity.role == "admin":
        admin = db.get(Admin, identity.user_id)
        if not admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
        return AuthenticatedIdentity(
            role="admin",
            id=admin.id,
            identifier=admin.username,
            display_name=admin.username,
        )

    if identity.role == "librarian":
        librarian = db.get(Librarian, identity.user_id)
        if not librarian:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Librarian not found")
        return AuthenticatedIdentity(
            role="librarian",
            id=librarian.id,
            identifier=librarian.email,
            display_name=f"{librarian.first_name} {librarian.last_name}".strip(),
        )

    user = db.get(User, identity.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return AuthenticatedIdentity(
        role="user",
        id=user.id,
        identifier=user.email,
        display_name=f"{user.first_name} {user.last_name}".strip(),
    )
