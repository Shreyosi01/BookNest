from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/books", tags=["books"])


def _get_owned_book(book_id: str, db: Session, current_user: models.User) -> models.Book:
    book = (
        db.query(models.Book)
        .filter(models.Book.id == book_id, models.Book.owner_id == current_user.id)
        .first()
    )
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


def _sync_completed_at(book: models.Book, new_status: str) -> None:
    """Keeps completed_at truthful: set the first time status becomes 'completed',
    cleared if status changes away from it (so re-marking as reading resets it)."""
    if new_status == "completed" and book.completed_at is None:
        book.completed_at = date.today()
    elif new_status != "completed":
        book.completed_at = None


@router.get("", response_model=list[schemas.BookOut])
def list_books(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Book).filter(models.Book.owner_id == current_user.id).all()


@router.post("", response_model=schemas.BookOut, status_code=status.HTTP_201_CREATED)
def create_book(
    payload: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = None
    if payload.catalog_book_id:
        existing = (
            db.query(models.Book)
            .filter(
                models.Book.owner_id == current_user.id,
                models.Book.catalog_book_id == payload.catalog_book_id,
            )
            .first()
        )
    if not existing and payload.title:
        existing = (
            db.query(models.Book)
            .filter(
                models.Book.owner_id == current_user.id,
                models.Book.title.ilike(payload.title.strip()),
                models.Book.author.ilike(payload.author.strip()),
            )
            .first()
        )
    if existing:
        existing.status = payload.status
        _sync_completed_at(existing, existing.status)
        if payload.catalog_book_id and not existing.catalog_book_id:
            existing.catalog_book_id = payload.catalog_book_id
        if payload.cover and not existing.cover:
            existing.cover = payload.cover
        if payload.total_pages and not existing.total_pages:
            existing.total_pages = payload.total_pages
        if payload.published_year and not existing.published_year:
            existing.published_year = payload.published_year
        db.commit()
        db.refresh(existing)
        return existing

    book = models.Book(**payload.model_dump(), owner_id=current_user.id)
    _sync_completed_at(book, book.status)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("/{book_id}", response_model=schemas.BookOut)
def get_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_owned_book(book_id, db, current_user)


@router.put("/{book_id}", response_model=schemas.BookOut)
def update_book(
    book_id: str,
    payload: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = _get_owned_book(book_id, db, current_user)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(book, field, value)
    if "status" in updates:
        _sync_completed_at(book, updates["status"])
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = _get_owned_book(book_id, db, current_user)
    db.delete(book)
    db.commit()
    return None