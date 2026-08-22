from datetime import date, timedelta
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.database import SessionLocal
from app.security import decode_access_token

# HTTPBearer gives Swagger's "Authorize" dialog a single field to paste a raw
# token into — matches our JSON login flow, unlike OAuth2PasswordBearer which
# expects a form-encoded username/password login (not what /auth/login does).
bearer_scheme = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def bump_streak(user: models.User, db: Session) -> None:
    """Updates the user's reading streak based on real usage, not a fake number.
    Called on every authenticated request. Increments once per calendar day:
    - same day as last active -> no change
    - exactly one day since last active -> streak += 1
    - more than one day (or first ever visit) -> streak resets to 1
    """
    today = date.today()
    if user.last_active_date == today:
        return

    if user.last_active_date == today - timedelta(days=1):
        user.current_streak = (user.current_streak or 0) + 1
    else:
        user.current_streak = 1

    user.last_active_date = today
    db.add(user)
    db.commit()
    db.refresh(user)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception

    bump_streak(user, db)
    return user