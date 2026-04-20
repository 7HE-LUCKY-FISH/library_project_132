from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..core.security import InvalidTokenError, decode_token
from ..db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)

DBSession = Annotated[Session, Depends(get_db)]


class CurrentIdentity:
    def __init__(self, user_id: int, role: str):
        self.user_id = user_id
        self.role = role


def get_current_identity(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> CurrentIdentity:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = decode_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    subject = payload["sub"]
    role = payload["role"]
    try:
        subject_role, subject_id = subject.split(":", 1)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token subject",
        ) from exc

    if subject_role != role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token role mismatch",
        )

    return CurrentIdentity(user_id=int(subject_id), role=role)


def require_role(*allowed_roles: str):
    def dependency(identity: Annotated[CurrentIdentity, Depends(get_current_identity)]) -> CurrentIdentity:
        if identity.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return identity

    return dependency
