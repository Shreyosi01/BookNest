from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
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


class UpdateProfileRequest(CamelModel):
    name: str = Field(min_length=1)


# ── Personal shelf books (Library/Wishlist) ────────────────────────────────

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
    catalog_book_id: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(CamelModel):
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
    catalog_book_id: Optional[str] = None


class BookOut(BookBase):
    id: str
    date_added: date
    completed_at: Optional[date] = None


# ── Shared catalog + public reviews ────────────────────────────────────────

class CatalogBookCreate(CamelModel):
    google_books_id: Optional[str] = None
    title: str
    author: str = ""
    isbn: str = ""
    category: str = ""
    genre: str = ""
    cover: str = ""
    published_year: int = 0
    total_pages: int = 0
    description: str = ""
    preview_link: str = ""
    buy_link: str = ""


class CatalogBookOut(CamelModel):
    id: str
    google_books_id: Optional[str] = None
    title: str
    author: str
    isbn: str
    category: str
    genre: str
    cover: str
    published_year: int
    total_pages: int
    description: str = ""
    preview_link: str = ""
    buy_link: str = ""
    average_rating: float = 0.0
    review_count: int = 0


class ReviewCreate(CamelModel):
    rating: int = Field(ge=1, le=5)
    text: str = ""


class ReviewOut(CamelModel):
    id: str
    rating: int
    text: str
    created_at: datetime
    reviewer_name: str
    reviewer_id: str


# ── AI recommendations ──────────────────────────────────────────────────────

class RecommendationRequest(CamelModel):
    genre: Optional[str] = None
    mood: Optional[str] = None
    query: Optional[str] = None


class RecommendationItem(CamelModel):
    title: str
    author: str = ""
    reason: str = ""


class RecommendationResponse(CamelModel):
    recommendations: list[RecommendationItem] = []


class BookInsightRequest(CamelModel):
    title: str
    author: str = ""


class BookInsightResponse(CamelModel):
    summary: str = ""
    themes: list[str] = []
    good_for: str = ""