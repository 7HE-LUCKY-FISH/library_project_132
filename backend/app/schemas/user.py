from datetime import datetime

from pydantic import BaseModel, EmailStr

from .common import ORMModel


class UserResponse(ORMModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    education: str
    is_approved: bool
    created_at: datetime


class UserDashboard(BaseModel):
    profile: UserResponse
    total_books: int
