from datetime import datetime

from pydantic import BaseModel, Field

from .common import ORMModel


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    genre: str = Field(min_length=1, max_length=800)
    image_url: str | None = None


class BookUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    genre: str = Field(min_length=1, max_length=800)
    image_url: str | None = None


class BookResponse(ORMModel):
    id: int
    title: str
    genre: str
    image_url: str | None
    created_by_librarian_id: int | None
    created_at: datetime
    updated_at: datetime
