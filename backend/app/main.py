from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import ai, auth, book_search, books, catalog, search

# Creates tables on startup if they don't exist yet.
Base.metadata.create_all(bind=engine)

# Auto-migration for existing SQLite databases
with engine.connect() as _conn:
    try:
        from sqlalchemy import text
        _cols = [r[1] for r in _conn.execute(text("PRAGMA table_info(books)")).fetchall()]
        if _cols and "catalog_book_id" not in _cols:
            _conn.execute(text("ALTER TABLE books ADD COLUMN catalog_book_id VARCHAR REFERENCES catalog_books(id)"))
            _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_books_catalog_book_id ON books (catalog_book_id)"))
            _conn.commit()
    except Exception:
        pass

app = FastAPI(title="BookNest API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(catalog.router)
app.include_router(ai.router)
app.include_router(book_search.router)
app.include_router(search.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}