"""Proxy book-search requests through the backend so the browser never calls
external APIs directly (avoids CORS, ad-blockers, and rate-limit issues).

Uses the **Open Library API** — completely free, no API key required.
"""

from __future__ import annotations

import re
import asyncio
from typing import Optional

import httpx
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/book-search", tags=["book-search"])

# Shared async HTTP client — reused across requests for connection pooling.
_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=15.0)
    return _client


CATEGORY_OPTIONS = [
    "Fiction", "Non-Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
    "Romance", "Horror", "Historical Fiction", "Literary Fiction", "Young Adult",
    "Children's", "Classics", "Biography", "Memoir", "Self-Help", "Psychology",
    "Philosophy", "History", "Science", "Technology", "Business", "Poetry",
    "Comics & Graphic Novels", "Cooking", "Travel", "Religion & Spirituality",
    "Health & Fitness", "Art & Design", "True Crime",
]


def _guess_category(subjects: list[str]) -> str:
    joined = " ".join(subjects).lower()
    for cat in CATEGORY_OPTIONS:
        if cat.lower() in joined:
            return cat
    return ""


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]*>", "", text) if text else ""


# ─── Open Library search ────────────────────────────────────────────────────

def _parse_ol_search_doc(doc: dict) -> dict:
    cover_id = doc.get("cover_i")
    cover = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg" if cover_id else ""
    isbns = doc.get("isbn") or []
    authors = ", ".join(doc.get("author_name") or [])
    subjects = (doc.get("subject") or [])[:10]

    # Extract first sentence if available
    description = ""
    first_sentence = doc.get("first_sentence")
    if first_sentence:
        if isinstance(first_sentence, list):
            description = first_sentence[0] if first_sentence else ""
        elif isinstance(first_sentence, dict):
            description = first_sentence.get("value", "")
        else:
            description = str(first_sentence)

    return {
        "googleBooksId": doc.get("key", ""),
        "title": doc.get("title", "Untitled"),
        "author": authors,
        "isbn": isbns[0] if isbns else "",
        "cover": cover,
        "publishedYear": doc.get("first_publish_year") or 0,
        "totalPages": doc.get("number_of_pages_median") or 0,
        "category": _guess_category(subjects),
        "description": description,
        "previewLink": f"https://openlibrary.org{doc['key']}" if doc.get("key") else "",
        "buyLink": "",
    }


def _parse_ol_subject_work(work: dict, subject_name: str) -> dict:
    cover_id = work.get("cover_id")
    cover = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg" if cover_id else ""
    authors = ", ".join(a.get("name", "") for a in (work.get("authors") or []))

    desc_raw = work.get("description", "")
    if isinstance(desc_raw, dict):
        desc_raw = desc_raw.get("value", "")
    description = _strip_html(str(desc_raw)) if desc_raw else ""

    return {
        "googleBooksId": work.get("key", ""),
        "title": work.get("title", "Untitled"),
        "author": authors,
        "isbn": "",
        "cover": cover,
        "publishedYear": work.get("first_publish_year") or 0,
        "totalPages": 0,
        "category": subject_name,
        "description": description,
        "previewLink": f"https://openlibrary.org{work['key']}" if work.get("key") else "",
        "buyLink": "",
    }


async def _fetch_description(client: httpx.AsyncClient, work_key: str) -> str:
    """Fetch the description for a single Open Library work."""
    try:
        url = f"https://openlibrary.org{work_key}.json"
        resp = await client.get(url)
        if resp.status_code != 200:
            return ""
        data = resp.json()
        desc = data.get("description", "")
        if isinstance(desc, dict):
            desc = desc.get("value", "")
        return _strip_html(str(desc)) if desc else ""
    except Exception:
        return ""


async def _enrich_descriptions(books: list[dict]) -> list[dict]:
    """Fetch full descriptions from the Works API for books that lack one."""
    client = _get_client()
    enrichable = []
    for i, book in enumerate(books[:15]):  # limit to first 15
        if not book["description"] and book["googleBooksId"].startswith("/works/"):
            enrichable.append((i, book["googleBooksId"]))

    if not enrichable:
        return books

    tasks = [_fetch_description(client, key) for _, key in enrichable]
    descriptions = await asyncio.gather(*tasks, return_exceptions=True)

    for (idx, _), desc in zip(enrichable, descriptions):
        if isinstance(desc, str) and desc:
            books[idx]["description"] = desc

    return books


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.get("/search")
async def search_books(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=40)):
    """Search books by title, author, or keyword using Open Library."""
    client = _get_client()
    params = {
        "q": q,
        "limit": limit,
        "fields": "key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,subject,first_sentence,cover_edition_key",
    }
    try:
        resp = await client.get("https://openlibrary.org/search.json", params=params)
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open Library search failed: {exc}")

    data = resp.json()
    docs = data.get("docs") or []
    books = [_parse_ol_search_doc(doc) for doc in docs if doc.get("title")]
    books = await _enrich_descriptions(books)
    return books


@router.get("/genre/{genre}")
async def search_by_genre(genre: str, limit: int = Query(20, ge=1, le=40)):
    """Browse popular books for a given genre/subject using Open Library Subjects API."""
    client = _get_client()
    slug = re.sub(r"[^a-z0-9]+", "_", genre.lower())
    try:
        resp = await client.get(f"https://openlibrary.org/subjects/{slug}.json", params={"limit": limit})
        if resp.status_code == 200:
            data = resp.json()
            works = data.get("works") or []
            books = [_parse_ol_subject_work(w, genre) for w in works if w.get("title")]
            books = await _enrich_descriptions(books)
            return books
    except httpx.HTTPError:
        pass  # fall through to search-based approach

    # Fallback: use search API with subject filter
    params = {
        "q": f"subject:{genre}",
        "limit": limit,
        "fields": "key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,subject,first_sentence,cover_edition_key",
    }
    try:
        resp = await client.get("https://openlibrary.org/search.json", params=params)
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open Library search failed: {exc}")

    data = resp.json()
    docs = data.get("docs") or []
    books = [_parse_ol_search_doc(doc) for doc in docs if doc.get("title")]
    books = await _enrich_descriptions(books)
    return books


@router.get("/author")
async def search_by_author(name: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=40)):
    """Search for all books by a particular author using Open Library."""
    client = _get_client()
    params = {
        "q": f"author:{name}",
        "limit": limit,
        "fields": "key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,subject,first_sentence,cover_edition_key",
    }
    try:
        resp = await client.get("https://openlibrary.org/search.json", params=params)
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open Library search failed: {exc}")

    data = resp.json()
    docs = data.get("docs") or []
    books = [_parse_ol_search_doc(doc) for doc in docs if doc.get("title")]
    books = await _enrich_descriptions(books)
    return books
