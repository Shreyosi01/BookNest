import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Camera, Check, Search, Loader2, X } from "lucide-react";

import Btn from "../components/common/Btn";
import type { Book, ReadingStatus } from "../types";
import { Input, ProgressBar, Select, StarRating } from "./pageHelpers";
import { searchBooks, CATEGORY_OPTIONS, BookSearchError } from "../services/googleBooksService";
import type { GoogleBookResult } from "../services/googleBooksService";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format";

interface AddBookPageProps {
  book?: Book;
  onSave: (data: Partial<Book>) => void;
  onCancel: () => void;
  /** Which status a brand-new book should start as (e.g. "wishlist" when opened from the Wishlist page). Ignored when editing. */
  defaultStatus?: ReadingStatus;
}

export default function AddBookPage({ book, onSave, onCancel, defaultStatus }: AddBookPageProps) {
  const isEdit = !!book;

  const [form, setForm] = useState({
    title: book?.title || "",
    author: book?.author || "",
    isbn: book?.isbn || "",
    category: book?.category || "",
    genre: book?.genre || "",
    status: (book?.status || defaultStatus || "not-started") as ReadingStatus,
    rating: book?.rating || 0,
    totalPages: String(book?.totalPages || ""),
    currentPage: String(book?.currentPage || ""),
    notes: book?.notes || "",
    quotes: book?.quotes.join("\n") || "",
    publishedYear: String(book?.publishedYear || ""),
  });
  const [coverUrl, setCoverUrl] = useState(book?.cover || "");

  const [showSearch, setShowSearch] = useState(!isEdit);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const progress = form.totalPages && form.currentPage
    ? Math.round(Number(form.currentPage) / Number(form.totalPages) * 100) : 0;

  function f(field: string) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || searching) return;
    setSearching(true);
    setSearchError(null);
    try {
      const items = await searchBooks(query.trim());
      setResults(items);
      if (items.length === 0) setSearchError("No results found. Try a different search, or fill the form in manually below.");
    } catch (err) {
      setSearchError(err instanceof BookSearchError ? err.message : "Something went wrong. You can still add the book manually below.");
    } finally {
      setSearching(false);
    }
  }

  function handleSelectResult(r: GoogleBookResult) {
    setForm((p) => ({
      ...p,
      title: r.title,
      author: r.author || p.author,
      isbn: r.isbn || p.isbn,
      publishedYear: r.publishedYear ? String(r.publishedYear) : p.publishedYear,
      totalPages: r.totalPages ? String(r.totalPages) : p.totalPages,
      category: r.category || p.category,
    }));
    if (r.cover) setCoverUrl(r.cover);
    setResults([]);
    setQuery("");
    setShowSearch(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({
      ...form,
      rating: form.rating,
      totalPages: Number(form.totalPages) || 0,
      currentPage: Number(form.currentPage) || 0,
      progress,
      publishedYear: Number(form.publishedYear) || 0,
      quotes: form.quotes.split("\n").filter(Boolean),
      cover: coverUrl || FALLBACK_COVER,
    });
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {isEdit ? "Back to Book" : "Back to Library"}
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">{isEdit ? "Edit Book" : "Add New Book"}</h1>

      {!isEdit && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Search for a book</h3>
            {!showSearch && (
              <button type="button" onClick={() => setShowSearch(true)} className="text-xs font-medium text-primary hover:underline">
                Search again
              </button>
            )}
          </div>

          {showSearch && (
            <>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Title, author, or ISBN…"
                    className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <Btn type="submit" disabled={searching}>
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Btn>
              </form>

              {searchError && <p className="text-xs text-muted-foreground">{searchError}</p>}

              {results.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                  {results.map((r) => (
                    <button
                      key={r.googleBooksId}
                      type="button"
                      onClick={() => handleSelectResult(r)}
                      className="flex gap-3 p-2.5 rounded-xl border border-border bg-background hover:border-primary hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-10 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                        {r.cover ? (
                          <img src={r.cover} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Camera className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{r.author || "Unknown author"}</p>
                        {r.publishedYear > 0 && <p className="text-xs text-muted-foreground mt-0.5">{r.publishedYear}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Can't find it? No problem — just fill in the details manually below.
              </p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Book Information</h3>
          <div className="flex items-start gap-5">
            <div className="relative w-24 h-32 flex-shrink-0">
              <div className="w-24 h-32 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-xs">Cover</span>
                  </div>
                )}
              </div>
              {coverUrl && (
                <button
                  type="button"
                  onClick={() => setCoverUrl("")}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <Input label="Book Title" value={form.title} onChange={f("title")} placeholder="The Great Gatsby" required />
              <Input label="Author" value={form.author} onChange={f("author")} placeholder="F. Scott Fitzgerald" required />
            </div>
          </div>

          <Input label="Cover image URL (optional)" value={coverUrl} onChange={setCoverUrl} placeholder="https://…" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="ISBN" value={form.isbn} onChange={f("isbn")} placeholder="978-0-000-00000-0" />
            <Input label="Published Year" value={form.publishedYear} onChange={f("publishedYear")} placeholder="2024" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={f("category")} options={CATEGORY_OPTIONS} required />
            <Input label="Genre" value={form.genre} onChange={f("genre")} placeholder="e.g. Literary Fiction" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Reading Status</h3>
          <Select label="Status" value={form.status} onChange={f("status") as any}
            options={["not-started", "reading", "paused", "completed", "wishlist"]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Pages" value={form.totalPages} onChange={f("totalPages")} placeholder="320" type="number" />
            <Input label="Current Page" value={form.currentPage} onChange={f("currentPage")} placeholder="0" type="number" />
          </div>
          {form.totalPages && form.currentPage && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your Rating</label>
            <StarRating rating={form.rating} size="md" onRate={(r) => setForm((p) => ({ ...p, rating: r }))} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Notes & Quotes</h3>
          <Input label="Personal Notes" value={form.notes} onChange={f("notes")} placeholder="Your thoughts on this book…" rows={4} />
          <Input label="Favorite Quotes" value={form.quotes} onChange={f("quotes")} placeholder="One quote per line…" rows={3} />
        </div>

        <div className="flex gap-3">
          <Btn type="submit" size="lg" className="flex-1 justify-center">
            <Check className="w-4 h-4" /> {isEdit ? "Save Changes" : "Add to Library"}
          </Btn>
          <Btn variant="outline" size="lg" onClick={onCancel}>Cancel</Btn>
        </div>
      </form>
    </div>
  );
}