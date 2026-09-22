from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, books, search

# Creates tables on startup if they don't exist yet. Fine for SQLite + a project this size;
# swap for Alembic migrations later if the schema needs to evolve without losing data.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BookNest API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(search.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}