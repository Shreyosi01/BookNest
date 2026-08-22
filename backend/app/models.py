import json
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
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

    # Updated automatically on every authenticated request (see dependencies.bump_streak).
    current_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)

    books = relationship("Book", back_populates="owner", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

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

    # Set automatically the moment status becomes "completed" (see routers/books.py);
    # cleared if the status is changed away from "completed". Powers the real
    # monthly-activity charts on the Dashboard and Goals pages.
    completed_at = Column(Date, nullable=True)

    owner = relationship("User", back_populates="books")