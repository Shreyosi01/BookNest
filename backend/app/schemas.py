from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model that serializes fields as camelCase JSON (e.g. total_pages -> totalPages)
    while keeping snake_case field names in Python, so this lines up with the frontend's
    Book type with zero mapping code on either side."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ── Auth ──────────────────────────────────────────────────────────────────

class SignupRequest(CamelModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(CamelModel):
    id: str
    name: str
    email: EmailStr
    current_streak: int = 0


# ── Books ─────────────────────────────────────────────────────────────────

class BookBase(CamelModel):
    title: str
    author: str
    isbn: str = ""
    category: str = ""
    genre: str = ""
    status: str = "not-started"
    rating: int = 0
    progress: int = 0
    total_pages: int = 0
    current_page: int = 0
    cover: str = ""
    notes: str = ""
    quotes: list[str] = []
    favorite: bool = False
    published_year: int = 0


class BookCreate(BookBase):
    pass


class BookUpdate(CamelModel):
    """All fields optional — used for partial updates (edit book, toggle favorite, etc.)."""

    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = None
    progress: Optional[int] = None
    total_pages: Optional[int] = None
    current_page: Optional[int] = None
    cover: Optional[str] = None
    notes: Optional[str] = None
    quotes: Optional[list[str]] = None
    favorite: Optional[bool] = None
    published_year: Optional[int] = None


class BookOut(BookBase):
    id: str
    date_added: date
    completed_at: Optional[date] = None