"""Proxy endpoint that relays searches to book APIs.

Tries Google Books first, falls back to Open Library if rate-limited.
Running this server-side avoids browser-level CORS issues.
"""

import asyncio
from fastapi import APIRouter, Query, HTTPException
import httpx

router = APIRouter(prefix="/search", tags=["search"])

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"
OPEN_LIBRARY_URL = "https://openlibrary.org/search.json"


async def _try_google_books(
    client: httpx.AsyncClient, q: str, start_index: int, max_results: int
) -> dict | None:
    """Try Google Books API. Returns None on rate-limit or failure."""
    for attempt in range(2):
        try:
            resp = await client.get(
                GOOGLE_BOOKS_URL,
                params={
                    "q": q,
                    "startIndex": start_index,
                    "maxResults": max_results,
                    "orderBy": "relevance",
                },
            )
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429:
                # Rate-limited — wait and retry once, then fall through
                if attempt == 0:
                    await asyncio.sleep(2)
                    continue
                return None
            return None
        except Exception:
            return None
    return None


def _open_library_to_google_format(ol_data: dict, max_results: int) -> dict:
    """Convert Open Library search results into Google Books-compatible format."""
    items = []
    for doc in ol_data.get("docs", [])[:max_results]:
        # Build thumbnail URL from cover ID
        cover_id = doc.get("cover_i")
        thumbnail = f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else ""

        # Get ISBN
        isbns = doc.get("isbn", [])
        isbn_13 = next((i for i in isbns if len(i) == 13), isbns[0] if isbns else "")

        industry_identifiers = []
        if isbn_13:
            industry_identifiers.append({"type": "ISBN_13", "identifier": isbn_13})

        items.append({
            "id": doc.get("key", ""),
            "volumeInfo": {
                "title": doc.get("title", "Untitled"),
                "subtitle": doc.get("subtitle", ""),
                "authors": doc.get("author_name", []),
                "description": (
                    doc.get("first_sentence", [""])[0]
                    if isinstance(doc.get("first_sentence"), list)
                    else doc.get("first_sentence", "")
                ) or "",
                "publishedDate": str(doc.get("first_publish_year", "")),
                "pageCount": doc.get("number_of_pages_median", 0) or 0,
                "categories": doc.get("subject", [])[:3],
                "imageLinks": {"thumbnail": thumbnail} if thumbnail else {},
                "industryIdentifiers": industry_identifiers,
                "averageRating": doc.get("ratings_average", 0) or 0,
                "ratingsCount": doc.get("ratings_count", 0) or 0,
                "publisher": (doc.get("publisher", []) or [""])[0] if doc.get("publisher") else "",
                "language": (doc.get("language", []) or [""])[0] if doc.get("language") else "",
            },
        })

    return {
        "kind": "books#volumes",
        "totalItems": ol_data.get("numFound", len(items)),
        "items": items,
    }


async def _try_open_library(
    client: httpx.AsyncClient, q: str, start_index: int, max_results: int
) -> dict | None:
    """Fallback to Open Library search API."""
    try:
        page = (start_index // max_results) + 1
        resp = await client.get(
            OPEN_LIBRARY_URL,
            params={
                "q": q,
                "page": page,
                "limit": max_results,
                "fields": "key,title,subtitle,author_name,first_sentence,first_publish_year,"
                          "number_of_pages_median,subject,cover_i,isbn,publisher,language,"
                          "ratings_average,ratings_count",
            },
        )
        if resp.status_code == 200:
            return _open_library_to_google_format(resp.json(), max_results)
        return None
    except Exception:
        return None


@router.get("")
async def search_books(
    q: str = Query(..., min_length=1, description="Search query"),
    start_index: int = Query(0, alias="startIndex", ge=0),
    max_results: int = Query(12, alias="maxResults", ge=1, le=40),
):
    """Search for books. Tries Google Books first, falls back to Open Library."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Try Google Books first
        result = await _try_google_books(client, q, start_index, max_results)
        if result and result.get("items"):
            return result

        # Fallback to Open Library
        result = await _try_open_library(client, q, start_index, max_results)
        if result:
            return result

    raise HTTPException(status_code=503, detail="Book search is temporarily unavailable. Please try again.")
