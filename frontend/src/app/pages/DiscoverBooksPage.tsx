import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Search,
  Loader2,
  BookOpen,
  Library,
  Bookmark,
  Star,
  ChevronDown,
  Check,
  X,
  Sparkles,
  Filter,
} from "lucide-react";

import Btn from "../components/common/Btn";
import type { Book, ReadingStatus } from "../types";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface GoogleBookResult {
  id: string;
  title: string;
  subtitle: string;
  authors: string[];
  description: string;
  thumbnail: string;
  publishedYear: number;
  pageCount: number;
  categories: string[];
  isbn: string;
  averageRating: number;
  ratingsCount: number;
  publisher: string;
  language: string;
}

type SearchMode = "all" | "title" | "author" | "genre";

const SEARCH_MODE_LABELS: Record<SearchMode, string> = {
  all: "All Fields",
  title: "Title",
  author: "Author",
  genre: "Genre / Subject",
};

const KNOWN_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Technology",
  "Self-Help",
  "Psychology",
  "Memoir",
  "Design",
  "Philosophy",
  "History",
  "Science",
];

const POPULAR_SEARCHES = [
  "Best sellers fiction",
  "Classic literature",
  "Science fiction",
  "Self improvement",
  "Psychology",
  "History",
  "Programming",
  "Biography",
];

/* ── Helpers ───────────────────────────────────────────────────────────── */

function guessCategory(rawCategories: string[]): string {
  const joined = rawCategories.join(" ").toLowerCase();
  return KNOWN_CATEGORIES.find((c) => joined.includes(c.toLowerCase())) || rawCategories[0] || "";
}

function buildQuery(query: string, mode: SearchMode): string {
  const q = query.trim();
  switch (mode) {
    case "title":
      return `intitle:${q}`;
    case "author":
      return `inauthor:${q}`;
    case "genre":
      return `subject:${q}`;
    default:
      return q;
  }
}

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

function parseGoogleBooksResponse(data: any): { results: GoogleBookResult[]; totalItems: number } {
  const results: GoogleBookResult[] = (data.items || []).map((item: any) => {
    const info = item.volumeInfo || {};
    const identifiers: { type: string; identifier: string }[] = info.industryIdentifiers || [];
    const isbn = identifiers.find((i: any) => i.type === "ISBN_13")?.identifier || identifiers[0]?.identifier || "";
    const thumbnail = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "").replace("http://", "https://");

    return {
      id: item.id,
      title: info.title || "Untitled",
      subtitle: info.subtitle || "",
      authors: info.authors || [],
      description: info.description || "",
      thumbnail,
      publishedYear: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) || 0 : 0,
      pageCount: info.pageCount || 0,
      categories: info.categories || [],
      isbn,
      averageRating: info.averageRating || 0,
      ratingsCount: info.ratingsCount || 0,
      publisher: info.publisher || "",
      language: info.language || "",
    };
  });

  return { results, totalItems: data.totalItems || 0 };
}

async function searchGoogleBooks(query: string, startIndex = 0): Promise<{ results: GoogleBookResult[]; totalItems: number }> {
  // Try backend proxy first (avoids CORS / rate-limit issues)
  try {
    const proxyRes = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}&maxResults=12&startIndex=${startIndex}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (proxyRes.ok) {
      return parseGoogleBooksResponse(await proxyRes.json());
    }
  } catch {
    // Backend proxy unavailable — fall through to direct call
  }

  // Fallback: call Google Books API directly
  const res = await fetch(
    `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=12&startIndex=${startIndex}&orderBy=relevance`
  );
  if (!res.ok) throw new Error("Search failed");
  return parseGoogleBooksResponse(await res.json());
}

/* ── Component ─────────────────────────────────────────────────────────── */

interface DiscoverBooksPageProps {
  onAddBook: (data: Partial<Book>) => Promise<void>;
  existingBooks: Book[];
}

export default function DiscoverBooksPage({ onAddBook, existingBooks }: DiscoverBooksPageProps) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedBooks, setAddedBooks] = useState<Map<string, ReadingStatus>>(new Map());
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastQuery = useRef("");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check which results are already in library
  function isAlreadyAdded(googleId: string, title: string): ReadingStatus | null {
    if (addedBooks.has(googleId)) return addedBooks.get(googleId)!;
    const existing = existingBooks.find(
      (b) => b.title.toLowerCase() === title.toLowerCase()
    );
    return existing ? existing.status : null;
  }

  async function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    if (!query.trim() || searching) return;
    const builtQuery = buildQuery(query, searchMode);
    lastQuery.current = builtQuery;
    setSearching(true);
    setSearchError(null);
    setPage(0);
    setExpandedId(null);
    try {
      const { results: items, totalItems: total } = await searchGoogleBooks(builtQuery);
      setResults(items);
      setTotalItems(total);
      setHasSearched(true);
      if (items.length === 0) setSearchError("No books found. Try different keywords or search mode.");
    } catch {
      setSearchError("Couldn't reach the book search right now. Please try again in a moment.");
    } finally {
      setSearching(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { results: items } = await searchGoogleBooks(lastQuery.current, nextPage * 12);
      setResults((prev) => [...prev, ...items]);
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleAddBook(result: GoogleBookResult, status: ReadingStatus) {
    setAddingIds((prev) => new Set(prev).add(result.id));
    try {
      const bookData: Partial<Book> = {
        title: result.title,
        author: result.authors.join(", ") || "Unknown Author",
        isbn: result.isbn,
        category: guessCategory(result.categories),
        genre: result.categories[0] || "",
        status,
        rating: 0,
        totalPages: result.pageCount,
        currentPage: 0,
        progress: 0,
        publishedYear: result.publishedYear,
        cover: result.thumbnail || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format",
        notes: "",
        quotes: [],
      };
      await onAddBook(bookData);
      setAddedBooks((prev) => new Map(prev).set(result.id, status));
    } catch {
      // Error handled by parent
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(result.id);
        return next;
      });
    }
  }

  function handlePopularSearch(term: string) {
    setQuery(term);
    setSearchMode("all");
    // Trigger search after setting query
    const builtQuery = buildQuery(term, "all");
    lastQuery.current = builtQuery;
    setSearching(true);
    setSearchError(null);
    setPage(0);
    setExpandedId(null);
    searchGoogleBooks(builtQuery)
      .then(({ results: items, totalItems: total }) => {
        setResults(items);
        setTotalItems(total);
        setHasSearched(true);
        if (items.length === 0) setSearchError("No books found. Try different keywords.");
      })
      .catch(() => setSearchError("Couldn't reach the book search right now."))
      .finally(() => setSearching(false));
  }

  const canLoadMore = results.length < totalItems;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-sm">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          Discover Books
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Search millions of books by title, author, or genre. Add them to your library or wishlist with one click.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          {/* Search mode selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-1.5 h-full px-3.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-colors min-w-[120px] justify-between"
            >
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{SEARCH_MODE_LABELS[searchMode]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
            {showModeDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                {(Object.keys(SEARCH_MODE_LABELS) as SearchMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setSearchMode(mode);
                      setShowModeDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm transition-colors text-left
                      ${searchMode === mode ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                  >
                    {searchMode === mode && <Check className="w-3.5 h-3.5" />}
                    <span className={searchMode !== mode ? "pl-5" : ""}>{SEARCH_MODE_LABELS[mode]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchMode === "author"
                  ? "e.g. J.K. Rowling, Stephen King…"
                  : searchMode === "title"
                  ? "e.g. Harry Potter, The Great Gatsby…"
                  : searchMode === "genre"
                  ? "e.g. Science Fiction, Mystery, Romance…"
                  : "Search by title, author, or keyword…"
              }
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Btn type="submit" disabled={searching || !query.trim()} size="md">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Btn>
        </form>
      </div>

      {/* Popular searches (shown before any search) */}
      {!hasSearched && !searching && (
        <div className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearch(term)}
                  className="px-4 py-2 bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Illustration / Empty state */}
          <div className="text-center mt-12 opacity-60">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Start searching to discover your next great read
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Searching millions of books…</p>
        </div>
      )}

      {/* Error state */}
      {searchError && !searching && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-muted-foreground">{searchError}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && !searching && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{results.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems.toLocaleString()}</span> results
            </p>
          </div>

          <div className="space-y-4">
            {results.map((result) => {
              const isExpanded = expandedId === result.id;
              const existingStatus = isAlreadyAdded(result.id, result.title);
              const isAdding = addingIds.has(result.id);

              return (
                <div
                  key={result.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    {/* Book cover */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-muted shadow-md border border-border/50 relative group">
                        {result.thumbnail ? (
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                            <BookOpen className="w-8 h-8 mb-1" />
                            <span className="text-[10px]">No Cover</span>
                          </div>
                        )}
                        {result.averageRating > 0 && (
                          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {result.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight line-clamp-2">
                          {result.title}
                          {result.subtitle && (
                            <span className="font-normal text-muted-foreground text-sm">
                              {" "}— {result.subtitle}
                            </span>
                          )}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          by <span className="font-medium text-foreground/80">{result.authors.join(", ") || "Unknown Author"}</span>
                        </p>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {result.publishedYear > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                              {result.publishedYear}
                            </span>
                          )}
                          {result.pageCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                              {result.pageCount} pages
                            </span>
                          )}
                          {result.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                              style={{
                                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                                color: "var(--primary)",
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                          {result.publisher && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                              {result.publisher}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {result.description && (
                          <div className="mt-3">
                            <p
                              className={`text-sm text-muted-foreground leading-relaxed ${
                                isExpanded ? "" : "line-clamp-3"
                              }`}
                              dangerouslySetInnerHTML={{
                                __html: result.description.replace(/<[^>]*>/g, ""),
                              }}
                            />
                            {result.description.length > 200 && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : result.id)}
                                className="text-xs font-medium text-primary hover:underline mt-1"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                        {existingStatus ? (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              {existingStatus === "wishlist" ? "In Wishlist" : "In Library"}
                            </div>
                          </div>
                        ) : (
                          <>
                            <Btn
                              size="sm"
                              variant="primary"
                              disabled={isAdding}
                              onClick={() => handleAddBook(result, "not-started")}
                            >
                              {isAdding ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Library className="w-3.5 h-3.5" />
                              )}
                              Add to Library
                            </Btn>
                            <Btn
                              size="sm"
                              variant="outline"
                              disabled={isAdding}
                              onClick={() => handleAddBook(result, "wishlist")}
                            >
                              {isAdding ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                              Add to Wishlist
                            </Btn>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {canLoadMore && (
            <div className="flex justify-center mt-8 mb-4">
              <Btn
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[200px] justify-center"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Load More Results
                  </>
                )}
              </Btn>
            </div>
          )}
        </>
      )}
    </div>
  );
}
