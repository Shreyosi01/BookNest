// ─── Book Search Service ───────────────────────────────────────────────────
// All search requests go through our backend API (/book-search/*) which
// proxies to Open Library. This avoids CORS issues, ad-blocker interference,
// and rate-limiting that happens with direct browser-to-API calls.

import { api } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const CATEGORY_OPTIONS = [
  "Fiction", "Non-Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
  "Romance", "Horror", "Historical Fiction", "Literary Fiction", "Young Adult",
  "Children's", "Classics", "Biography", "Memoir", "Self-Help", "Psychology",
  "Philosophy", "History", "Science", "Technology", "Business", "Poetry",
  "Comics & Graphic Novels", "Cooking", "Travel", "Religion & Spirituality",
  "Health & Fitness", "Art & Design", "True Crime",
];

export interface GoogleBookResult {
  googleBooksId: string;
  title: string;
  author: string;
  isbn: string;
  cover: string;
  publishedYear: number;
  totalPages: number;
  category: string;
  description: string;
  previewLink: string;
  buyLink: string;
}

/** Thrown by search functions with a machine-readable code so callers can show
 * a specific, honest message instead of a generic "something went wrong." */
export class BookSearchError extends Error {
  code: "network" | "rate_limited" | "http_error";
  constructor(code: "network" | "rate_limited" | "http_error", message: string) {
    super(message);
    this.code = code;
  }
}

// ─── Backend-proxied search functions ──────────────────────────────────────

async function fetchFromBackend(endpoint: string): Promise<GoogleBookResult[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`);
  } catch {
    throw new BookSearchError(
      "network",
      "Couldn't reach the search server. Make sure the backend is running."
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail || `Search failed (HTTP ${res.status})`;
    throw new BookSearchError("http_error", typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  const data: GoogleBookResult[] = await res.json();
  return data;
}

export function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const params = new URLSearchParams({ q: query, limit: "20" });
  return fetchFromBackend(`/book-search/search?${params.toString()}`);
}

export function searchByGenre(genre: string): Promise<GoogleBookResult[]> {
  const encoded = encodeURIComponent(genre);
  return fetchFromBackend(`/book-search/genre/${encoded}?limit=20`);
}

export function searchByAuthor(author: string): Promise<GoogleBookResult[]> {
  const params = new URLSearchParams({ name: author, limit: "20" });
  return fetchFromBackend(`/book-search/author?${params.toString()}`);
}