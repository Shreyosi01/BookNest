import { useState } from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  Grid3X3,
  List,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Heart,
} from "lucide-react";

import Btn from "../components/common/Btn";
import StatusBadge from "../components/common/StatusBadge";
import type { Book } from "../types";

interface LibraryPageProps {
  books: Book[];
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onAdd: () => void;
  onToggleFavorite: (id: string) => void;
}

const CATEGORIES = [
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

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    Fiction: "bg-indigo-50 text-indigo-700",
    "Non-Fiction": "bg-teal-50 text-teal-700",
    Technology: "bg-cyan-50 text-cyan-700",
    "Self-Help": "bg-emerald-50 text-emerald-700",
    Psychology: "bg-violet-50 text-violet-700",
    Memoir: "bg-rose-50 text-rose-700",
    Design: "bg-pink-50 text-pink-700",
    Philosophy: "bg-amber-50 text-amber-700",
    History: "bg-orange-50 text-orange-700",
    Science: "bg-sky-50 text-sky-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[category] ?? "bg-slate-100 text-slate-600"}`}>
      {category}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "text-amber-400" : "text-slate-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function BookCard({
  book,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  book: Book;
  viewMode: "grid" | "list";
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md">
        <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="truncate font-semibold text-foreground">{book.title}</h4>
              <p className="truncate text-sm text-muted-foreground">{book.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={book.status} />
              <CategoryBadge category={book.category} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={book.rating} />
            {book.status === "reading" && (
              <div className="flex flex-1 items-center gap-2">
                <ProgressBar value={book.progress} />
                <span className="text-xs text-muted-foreground">{book.progress}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleFavorite} className={`rounded-lg p-2 ${book.favorite ? "text-rose-500" : "text-muted-foreground"}`}>
            <Heart className={`h-4 w-4 ${book.favorite ? "fill-rose-500" : ""}`} />
          </button>
          <button onClick={onView} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></button>
          <button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Edit2 className="h-4 w-4" /></button>
          <button onClick={onDelete} className="rounded-lg p-2 text-red-400 hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg" onClick={onView}>
      <div className="relative h-48 bg-muted">
        <img src={book.cover} alt={book.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute right-3 top-3 rounded-full p-2 ${book.favorite ? "bg-rose-500 text-white" : "bg-black/30 text-white"}`}
        >
          <Heart className={`h-4 w-4 ${book.favorite ? "fill-white" : ""}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={book.status} />
        </div>
      </div>
      <div className="p-4">
        <h4 className="mb-1 line-clamp-2 font-semibold text-foreground">{book.title}</h4>
        <p className="mb-3 text-xs text-muted-foreground">{book.author}</p>
        <div className="mb-3 flex items-center justify-between">
          <CategoryBadge category={book.category} />
          <StarRating rating={book.rating} />
        </div>
        {book.status === "reading" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{book.progress}%</span>
            </div>
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage({
  books,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onToggleFavorite,
}: LibraryPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");

  const filtered = books
    .filter((book) => book.status !== "wishlist")
    .filter((book) => !search || book.title.toLowerCase().includes(search.toLowerCase()) || book.author.toLowerCase().includes(search.toLowerCase()))
    .filter((book) => !filterCat || book.category === filterCat)
    .filter((book) => !filterStatus || book.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "progress") return b.progress - a.progress;
      return b.dateAdded.localeCompare(a.dateAdded);
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Library</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{filtered.length} books</p>
        </div>
        <Btn onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add Book
        </Btn>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search library…"
            className="w-full rounded-xl border border-border bg-input-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filterCat}
              onChange={(event) => setFilterCat(event.target.value)}
              className="appearance-none rounded-xl border border-border bg-input-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="appearance-none rounded-xl border border-border bg-input-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="not-started">Not Started</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="appearance-none rounded-xl border border-border bg-input-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="dateAdded">Newest First</option>
              <option value="title">Title A–Z</option>
              <option value="rating">Top Rated</option>
              <option value="progress">Most Progress</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-input-background">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-semibold text-foreground">No books found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              viewMode="grid"
              onView={() => onView(book)}
              onEdit={() => onEdit(book)}
              onDelete={() => onDelete(book)}
              onToggleFavorite={() => onToggleFavorite(book.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              viewMode="list"
              onView={() => onView(book)}
              onEdit={() => onEdit(book)}
              onDelete={() => onDelete(book)}
              onToggleFavorite={() => onToggleFavorite(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}