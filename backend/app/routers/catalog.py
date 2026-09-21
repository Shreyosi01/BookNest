from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/catalog", tags=["catalog"])


def _with_rating(db: Session, book: models.CatalogBook) -> schemas.CatalogBookOut:
    avg_rating, count = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.catalog_book_id == book.id)
        .one()
    )
    data = schemas.CatalogBookOut.model_validate(book)
    data.average_rating = round(float(avg_rating), 1) if avg_rating else 0.0
    data.review_count = count or 0
    return data


from datetime import datetime

@router.post("/books", response_model=schemas.CatalogBookOut, status_code=status.HTTP_201_CREATED)
def upsert_catalog_book(
    payload: schemas.CatalogBookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Finds-or-creates the shared catalog record for a book. Called whenever
    someone opens a book's detail page from Discover, so reviews always attach
    to the same row instead of creating duplicates."""
    existing = None
    if payload.google_books_id:
        existing = (
            db.query(models.CatalogBook)
            .filter(models.CatalogBook.google_books_id == payload.google_books_id)
            .first()
        )
    if not existing and payload.title:
        existing = (
            db.query(models.CatalogBook)
            .filter(
                models.CatalogBook.title.ilike(payload.title.strip()),
                models.CatalogBook.author.ilike(payload.author.strip()),
            )
            .first()
        )
    if existing:
        return _with_rating(db, existing)

    data = payload.model_dump()
    if not data.get("google_books_id"):
        data["google_books_id"] = None

    book = models.CatalogBook(**data)
    db.add(book)
    db.commit()
    db.refresh(book)
    return _with_rating(db, book)


@router.get("/books/{book_id}", response_model=schemas.CatalogBookOut)
def get_catalog_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(models.CatalogBook).filter(models.CatalogBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return _with_rating(db, book)


@router.get("/books/{book_id}/reviews", response_model=list[schemas.ReviewOut])
def list_reviews(book_id: str, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.catalog_book_id == book_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [
        schemas.ReviewOut(
            id=r.id, rating=r.rating, text=r.text, created_at=r.created_at,
            reviewer_name=r.user.name, reviewer_id=r.user_id,
        )
        for r in reviews
    ]


@router.post("/books/{book_id}/reviews", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def upsert_review(
    book_id: str,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Writing a second review for the same book updates your existing one
    (one review per user per book) rather than creating a duplicate."""
    book = db.query(models.CatalogBook).filter(models.CatalogBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    review = (
        db.query(models.Review)
        .filter(models.Review.catalog_book_id == book_id, models.Review.user_id == current_user.id)
        .first()
    )
    if review:
        review.rating = payload.rating
        review.text = payload.text
        review.updated_at = datetime.utcnow()
    else:
        review = models.Review(
            catalog_book_id=book_id,
            user_id=current_user.id,
            rating=payload.rating,
            text=payload.text,
        )
        db.add(review)

    # Sync rating to personal shelf book if the user already has this book
    user_shelf_book = (
        db.query(models.Book)
        .filter(models.Book.catalog_book_id == book_id, models.Book.owner_id == current_user.id)
        .first()
    )
    if user_shelf_book:
        user_shelf_book.rating = payload.rating

    db.commit()
    db.refresh(review)
    return schemas.ReviewOut(
        id=review.id, rating=review.rating, text=review.text, created_at=review.created_at,
        reviewer_name=current_user.name, reviewer_id=current_user.id,
    )


@router.delete("/books/{book_id}/reviews/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_review(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    review = (
        db.query(models.Review)
        .filter(models.Review.catalog_book_id == book_id, models.Review.user_id == current_user.id)
        .first()
    )
    if review:
        db.delete(review)
        db.commit()
    return None