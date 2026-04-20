from datetime import datetime

from pydantic import BaseModel

from .common import ORMModel


class AdminSummary(ORMModel):
    id: int
    username: str
    created_at: datetime


class AdminDashboard(BaseModel):
    total_users: int
    approved_users: int
    pending_users: int
    total_librarians: int
    total_books: int
