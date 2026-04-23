from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import ORMModel


class LibrarianBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    position: str
    is_active: bool = True


class LibrarianCreate(LibrarianBase):
    password: str


class LibrarianUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    position: str
    is_active: bool = True
    password: str | None = None


class LibrarianResponse(ORMModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    position: str
    is_active: bool
    created_at: datetime


class LibrarianDashboard(BaseModel):
    total_books: int
    active_librarians: int
