import json
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class JSONEncodedList(TypeDecorator):
    """Stores a Python list[str] as a JSON string in a TEXT column."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if not value:
            return []
        return json.loads(value)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    current_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)

    books = relationship("Book", back_populates="owner", cascade="all, delete-orphan")


class Book(Base):
    """A user's personal shelf entry (Library/Wishlist). Private to its owner.
    catalog_book_id links it back to the shared public catalog record (when the
    book was added via Add Books / Discover) so a "Completed" book can surface
    the public review flow for the same book."""

    __tablename__ = "books"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    catalog_book_id = Column(String, ForeignKey("catalog_books.id"), nullable=True, index=True)

    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, default="")
    category = Column(String, default="")
    genre = Column(String, default="")
    status = Column(String, default="not-started")  # reading | completed | paused | wishlist | not-started
    rating = Column(Integer, default=0)
    progress = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)
    current_page = Column(Integer, default=0)
    cover = Column(String, default="")
    notes = Column(Text, default="")
    quotes = Column(JSONEncodedList, default=list)
    favorite = Column(Boolean, default=False)
    date_added = Column(Date, default=date.today)
    published_year = Column(Integer, default=0)
    completed_at = Column(Date, nullable=True)

    owner = relationship("User", back_populates="books")


class CatalogBook(Base):
    """A shared, public record of a real book — one row per book, regardless of
    how many users have it on their shelf. Reviews attach to this."""

    __tablename__ = "catalog_books"

    id = Column(String, primary_key=True, default=generate_uuid)
    google_books_id = Column(String, unique=True, index=True, nullable=True)

    title = Column(String, nullable=False)
    author = Column(String, default="")
    isbn = Column(String, default="")
    category = Column(String, default="")
    genre = Column(String, default="")
    cover = Column(String, default="")
    published_year = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)
    description = Column(Text, default="")
    preview_link = Column(String, default="")
    buy_link = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="catalog_book", cascade="all, delete-orphan")


class Review(Base):
    """A public review, visible to every user. One per user per book — writing
    a second review for the same book updates the existing one instead."""

    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("catalog_book_id", "user_id", name="uq_review_per_user_per_book"),)

    id = Column(String, primary_key=True, default=generate_uuid)
    catalog_book_id = Column(String, ForeignKey("catalog_books.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    catalog_book = relationship("CatalogBook", back_populates="reviews")
    user = relationship("User")