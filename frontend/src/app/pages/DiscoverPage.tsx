import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { Search, Loader2, Compass, Sparkles, BookOpen, Bookmark, ChevronDown, ChevronUp, Star, BookMarked, Users, Tag } from "lucide-react";

import { searchBooks, searchByGenre, searchByAuthor, CATEGORY_OPTIONS, BookSearchError } from "../services/googleBooksService";
import type { GoogleBookResult } from "../services/googleBooksService";
import { getRecommendations } from "../services/aiService";
import type { AIRecommendation } from "../services/aiService";
import { Select } from "./pageHelpers";

/* ── Trending genre chips shown in the empty state ─────────────────────────── */
const TRENDING_GENRES = [
  { label: "Fantasy", emoji: "🧙" },
  { label: "Romance", emoji: "💕" },
  { label: "Mystery", emoji: "🔍" },
  { label: "Science Fiction", emoji: "🚀" },
  { label: "Thriller", emoji: "🎯" },
  { label: "Horror", emoji: "👻" },
  { label: "Biography", emoji: "📖" },
  { label: "Self-Help", emoji: "✨" },
  { label: "History", emoji: "🏛️" },
  { label: "Classics", emoji: "📚" },
];

/* ── CSS-in-JS keyframes (injected once) ───────────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes discover-fade-up {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes discover-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.discover-card-enter {
  animation: discover-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.discover-shimmer {
  background: linear-gradient(90deg, transparent 33%, rgba(255,255,255,0.08) 50%, transparent 66%);
  background-size: 200% 100%;
  animation: discover-shimmer 1.6s ease-in-out infinite;
}
`;

interface DiscoverPageProps {
  onSelectBook: (book: GoogleBookResult) => void;
  onQuickAdd: (book: GoogleBookResult, status: "wishlist" | "not-started") => void;
  onManualAdd: () => void;
}

/* ── Search mode label builder ─────────────────────────────────────────────── */
function buildResultsLabel(mode: "title" | "genre" | "author", term: string): string {
  switch (mode) {
    case "genre": return `Popular ${term} Books`;
    case "author": return `Books by ${term}`;
    default: return `Results for "${term}"`;
  }
}

/* ── Individual book card ──────────────────────────────────────────────────── */
function BookCard({
  book,
  index,
  onSelect,
  onQuickAdd,
  addingKey,
}: {
  book: GoogleBookResult;
  index: number;
  onSelect: () => void;
  onQuickAdd: (status: "wishlist" | "not-started") => void;
  addingKey: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const desc = book.description || "";
  const isLong = desc.length > 200;
  const shown = expanded || !isLong ? desc : `${desc.slice(0, 200)}…`;

  return (
    <div
      className="discover-card-enter group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* ── Cover image ──────────────────────────────────────────────── */}
        <button
          onClick={onSelect}
          className="relative flex-shrink-0 sm:w-44 w-full h-64 sm:h-auto overflow-hidden bg-muted cursor-pointer"
        >
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground p-4 text-center text-sm">
              <BookMarked className="w-10 h-10 opacity-40" />
            </div>
          )}
          {/* Subtle gradient overlay on cover bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent sm:hidden" />
        </button>

        {/* ── Info section ─────────────────────────────────────────────── */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
          {/* Title & Author */}
          <button onClick={onSelect} className="text-left group/title">
            <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover/title:text-primary transition-colors">
              {book.title}
            </h3>
          </button>
          <p className="text-sm text-muted-foreground mt-1">
            {book.author || "Unknown author"}
          </p>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {book.publishedYear > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                📅 {book.publishedYear}
              </span>
            )}
            {book.totalPages > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                📄 {book.totalPages} pages
              </span>
            )}
            {book.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                <Tag className="w-3 h-3" /> {book.category}
              </span>
            )}
          </div>

          {/* Description / Summary */}
          {desc && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {shown}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1.5"
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Spacer pushes actions to bottom */}
          <div className="flex-1 min-h-3" />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => onQuickAdd("not-started")}
              disabled={addingKey === `${book.googleBooksId}-not-started`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {addingKey === `${book.googleBooksId}-not-started` ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              Add to Library
            </button>
            <button
              onClick={() => onQuickAdd("wishlist")}
              disabled={addingKey === `${book.googleBooksId}-wishlist`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-60"
            >
              {addingKey === `${book.googleBooksId}-wishlist` ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              Wishlist
            </button>
            <button
              onClick={onSelect}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-muted-foreground text-xs font-semibold hover:bg-muted hover:text-foreground transition-colors ml-auto"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Loading skeleton ──────────────────────────────────────────────────────── */
function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
          <div className="sm:w-44 w-full h-52 sm:h-64 bg-muted" />
          <div className="flex-1 p-6 space-y-3">
            <div className="h-5 w-3/5 bg-muted rounded-lg" />
            <div className="h-4 w-2/5 bg-muted rounded-lg" />
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
            <div className="space-y-2 mt-3">
              <div className="h-3.5 w-full bg-muted rounded" />
              <div className="h-3.5 w-4/5 bg-muted rounded" />
              <div className="h-3.5 w-3/5 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Discover Page ────────────────────────────────────────────────────── */
export default function DiscoverPage({ onSelectBook, onQuickAdd, onManualAdd }: DiscoverPageProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"title" | "genre" | "author">("title");
  const [searchTerm, setSearchTerm] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Ask AI
  const [showAskAI, setShowAskAI] = useState(false);
  const [aiGenre, setAiGenre] = useState("");
  const [aiMood, setAiMood] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<AIRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [resolvingTitle, setResolvingTitle] = useState<string | null>(null);

  // Inject animation keyframes once
  useEffect(() => {
    const id = "discover-animations";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = ANIMATION_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll to results on new search
  useEffect(() => {
    if (hasSearched && results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results, hasSearched]);

  async function runSearch(fn: () => Promise<GoogleBookResult[]>, mode: "title" | "genre" | "author", term: string) {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchMode(mode);
    setSearchTerm(term);
    setResults([]); // clear for animation re-trigger
    try {
      const items = await fn();
      setResults(items);
      if (items.length === 0) setError("No books found. Try a different search term.");
    } catch (err) {
      setError(err instanceof BookSearchError ? err.message : "Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setGenre("");
    setAuthor("");
    runSearch(() => searchBooks(query.trim()), "title", query.trim());
  }

  function handleGenreChange(value: string) {
    setGenre(value);
    setQuery("");
    setAuthor("");
    if (value) runSearch(() => searchByGenre(value), "genre", value);
  }

  function handleAuthorSubmit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim()) return;
    setQuery("");
    setGenre("");
    runSearch(() => searchByAuthor(author.trim()), "author", author.trim());
  }

  function handleGenreChipClick(genreName: string) {
    setGenre(genreName);
    setQuery("");
    setAuthor("");
    runSearch(() => searchByGenre(genreName), "genre", genreName);
  }

  async function handleQuickAdd(book: GoogleBookResult, status: "wishlist" | "not-started") {
    setAddingKey(`${book.googleBooksId}-${status}`);
    try {
      await onQuickAdd(book, status);
    } finally {
      setAddingKey(null);
    }
  }

  async function handleAskAI(e: FormEvent) {
    e.preventDefault();
    if (!aiGenre && !aiMood.trim() && !aiQuery.trim()) {
      setAiError("Give the AI at least a genre, mood, or description to work with.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResults([]);
    try {
      const { recommendations } = await getRecommendations({
        genre: aiGenre || undefined,
        mood: aiMood.trim() || undefined,
        query: aiQuery.trim() || undefined,
      });
      setAiResults(recommendations);
      if (recommendations.length === 0) setAiError("The AI didn't return any suggestions. Try rephrasing.");
    } catch {
      setAiError("Couldn't reach the AI recommender right now. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSelectRecommendation(rec: AIRecommendation) {
    setResolvingTitle(rec.title);
    setAiError(null);
    try {
      const matches = await searchBooks(`${rec.title} ${rec.author}`);
      if (matches.length === 0) {
        setAiError(`Couldn't find "${rec.title}" in the book search — try searching for it manually above.`);
        return;
      }
      onSelectBook(matches[0]);
    } catch (err) {
      setAiError(err instanceof BookSearchError ? err.message : "Something went wrong finding that book.");
    } finally {
      setResolvingTitle(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Compass className="w-7 h-7 text-primary" />
          Discover Books
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search real books, see the cover and story summary, and add them to your Library or Wishlist
        </p>
      </div>

      {/* ── AI Recommendation section ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Ask AI for a recommendation
          </h3>
          {!showAskAI && (
            <button type="button" onClick={() => setShowAskAI(true)} className="text-xs font-medium text-primary hover:underline">
              Open
            </button>
          )}
        </div>

        {showAskAI && (
          <form onSubmit={handleAskAI} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Select label="Genre (optional)" value={aiGenre} onChange={setAiGenre} options={CATEGORY_OPTIONS} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Mood (optional)</label>
                <input
                  value={aiMood}
                  onChange={(e) => setAiMood(e.target.value)}
                  placeholder="e.g. cozy, fast-paced, heartbreaking"
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Or describe what you're after (optional)</label>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. something like Dune but shorter, or a book about grief that isn't too heavy"
                rows={2}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? "Thinking…" : "Get recommendations"}
            </button>

            {aiError && <p className="text-xs text-muted-foreground">{aiError}</p>}

            {aiResults.length > 0 && (
              <div className="space-y-2 pt-2">
                {aiResults.map((rec) => (
                  <button
                    key={rec.title}
                    type="button"
                    onClick={() => handleSelectRecommendation(rec)}
                    disabled={resolvingTitle === rec.title}
                    className="w-full text-left p-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-muted transition-colors disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{rec.title}</p>
                      {resolvingTitle === rec.title && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.author}</p>
                    {rec.reason && <p className="text-xs text-muted-foreground mt-1 italic">{rec.reason}</p>}
                  </button>
                ))}
              </div>
            )}
          </form>
        )}
      </div>

      {/* ── Search controls ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        {/* Title search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by book title, author, or ISBN…"
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 flex items-center gap-2"
          >
            {loading && searchMode === "title" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {/* Genre & Author */}
        <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" /> Browse by genre
            </label>
            <select
              value={genre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="">Select…</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAuthorSubmit} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" /> Browse by author
            </label>
            <div className="flex gap-2">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Stephen King"
                className="flex-1 bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                type="submit"
                disabled={loading && searchMode === "author"}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
              >
                {loading && searchMode === "author" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-right">
          <button type="button" onClick={onManualAdd} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            Can't find it? Add a book manually
          </button>
        </div>
      </div>

      {/* ── Error message ──────────────────────────────────────────────── */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Try searching for a different title, genre, or author</p>
        </div>
      )}

      {/* ── Empty state: before first search ───────────────────────────── */}
      {!hasSearched && !error && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-5 relative">
            <Compass className="w-10 h-10 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Find Your Next Read</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Search by title, browse by genre, or discover books by your favorite author. 
            Every result comes with real cover art and a story summary.
          </p>

          {/* Trending genre chips */}
          <div className="max-w-lg mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Trending Genres</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {TRENDING_GENRES.map((g) => (
                <button
                  key={g.label}
                  onClick={() => handleGenreChipClick(g.label)}
                  className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {loading && <ResultsSkeleton />}

      {/* ── Results ────────────────────────────────────────────────────── */}
      {results.length > 0 && (
        <div ref={resultsRef} className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              {searchMode === "genre" && <Tag className="w-5 h-5 text-primary" />}
              {searchMode === "author" && <Users className="w-5 h-5 text-primary" />}
              {searchMode === "title" && <Search className="w-5 h-5 text-primary" />}
              {buildResultsLabel(searchMode, searchTerm)}
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              {results.length} {results.length === 1 ? "book" : "books"} found
            </span>
          </div>

          {/* Book cards */}
          {results.map((book, i) => (
            <BookCard
              key={book.googleBooksId}
              book={book}
              index={i}
              onSelect={() => onSelectBook(book)}
              onQuickAdd={(status) => handleQuickAdd(book, status)}
              addingKey={addingKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}