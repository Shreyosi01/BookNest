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
    book = models.Book(**payload.model_dump(), owner_id=current_user.id)
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
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(book, field, value)
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