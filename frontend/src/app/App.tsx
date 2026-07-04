import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, LayoutDashboard, Heart, Target, BarChart3, Sparkles,
  User, Settings, LogOut, Search, Bell, Sun, Moon, Menu, X,
  Plus, Grid3X3, List, Star, Edit2, Trash2, Eye, BookMarked,
  TrendingUp, Award, Clock, ChevronRight, Filter,
  ArrowRight, Check, AlertCircle,
  Calendar, Flame, Tag, Quote, Bookmark, MoreHorizontal,
  Download, Shield, Lock, Camera, ArrowLeft,
  ChevronDown, Zap, Library, FileText, Layers
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "dashboard" | "library" | "book-detail" | "add-book" | "edit-book" | "wishlist" | "goals" | "analytics" | "profile" | "settings";
type ReadingStatus = "reading" | "completed" | "paused" | "wishlist" | "not-started";
type AuthMode = "signin" | "signup" | "forgot";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  genre: string;
  status: ReadingStatus;
  rating: number;
  progress: number;
  totalPages: number;
  currentPage: number;
  cover: string;
  notes: string;
  quotes: string[];
  favorite: boolean;
  dateAdded: string;
  publishedYear: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOOKS: Book[] = [
  {
    id: "1", title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt",
    isbn: "978-0135957059", category: "Technology", genre: "Programming",
    status: "completed", rating: 5, progress: 100, totalPages: 352, currentPage: 352,
    cover: "https://images.unsplash.com/photo-1516979187789-bb3b5e44524e?w=200&h=280&fit=crop&auto=format",
    notes: "Essential reading for any developer. The DRY principle changed how I write code forever.",
    quotes: ["Don't live with broken windows.", "Think! About your work."],
    favorite: true, dateAdded: "2024-01-15", publishedYear: 2019,
  },
  {
    id: "2", title: "Atomic Habits", author: "James Clear",
    isbn: "978-0735211292", category: "Self-Help", genre: "Personal Development",
    status: "completed", rating: 5, progress: 100, totalPages: 320, currentPage: 320,
    cover: "https://images.unsplash.com/photo-1541963463532-d153efea52d9?w=200&h=280&fit=crop&auto=format",
    notes: "Small habits compound into massive change. The 1% rule reshapes everything.",
    quotes: ["Every action is a vote for the type of person you wish to become."],
    favorite: true, dateAdded: "2024-02-20", publishedYear: 2018,
  },
  {
    id: "3", title: "Dune", author: "Frank Herbert",
    isbn: "978-0441013593", category: "Fiction", genre: "Science Fiction",
    status: "reading", rating: 4, progress: 65, totalPages: 688, currentPage: 447,
    cover: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=280&fit=crop&auto=format",
    notes: "The political intrigue is fascinating. Stilgar is a compelling character.",
    quotes: ["I must not fear. Fear is the mind-killer."],
    favorite: false, dateAdded: "2024-03-01", publishedYear: 1965,
  },
  {
    id: "4", title: "Sapiens", author: "Yuval Noah Harari",
    isbn: "978-0062316097", category: "Non-Fiction", genre: "History",
    status: "reading", rating: 4, progress: 40, totalPages: 443, currentPage: 177,
    cover: "https://images.unsplash.com/photo-1507842217343-583bb2515b46?w=200&h=280&fit=crop&auto=format",
    notes: "Mind-bending perspective on human history and civilization.",
    quotes: ["History is something very few people have been doing while everyone else was ploughing fields."],
    favorite: false, dateAdded: "2024-03-10", publishedYear: 2011,
  },
  {
    id: "5", title: "1984", author: "George Orwell",
    isbn: "978-0451524935", category: "Fiction", genre: "Dystopian",
    status: "completed", rating: 5, progress: 100, totalPages: 328, currentPage: 328,
    cover: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=200&h=280&fit=crop&auto=format",
    notes: "Terrifyingly relevant. Big Brother watches in new forms today.",
    quotes: ["War is Peace. Freedom is Slavery. Ignorance is Strength.", "If you want to keep a secret, you must also hide it from yourself."],
    favorite: true, dateAdded: "2024-01-28", publishedYear: 1949,
  },
  {
    id: "6", title: "Clean Code", author: "Robert C. Martin",
    isbn: "978-0132350884", category: "Technology", genre: "Programming",
    status: "paused", rating: 3, progress: 35, totalPages: 431, currentPage: 151,
    cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&h=280&fit=crop&auto=format",
    notes: "Some good principles but some outdated advice. SOLID principles are gold.",
    quotes: ["Any fool can write code that a computer can understand. Good programmers write code that humans can understand."],
    favorite: false, dateAdded: "2024-02-05", publishedYear: 2008,
  },
  {
    id: "7", title: "Thinking, Fast and Slow", author: "Daniel Kahneman",
    isbn: "978-0374533557", category: "Psychology", genre: "Behavioral Science",
    status: "completed", rating: 4, progress: 100, totalPages: 499, currentPage: 499,
    cover: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=200&h=280&fit=crop&auto=format",
    notes: "System 1 vs System 2 thinking is an incredibly useful framework.",
    quotes: ["We can be blind to the obvious, and we are also blind to our blindness."],
    favorite: false, dateAdded: "2023-11-12", publishedYear: 2011,
  },
  {
    id: "8", title: "Project Hail Mary", author: "Andy Weir",
    isbn: "978-0593135204", category: "Fiction", genre: "Science Fiction",
    status: "reading", rating: 5, progress: 28, totalPages: 476, currentPage: 133,
    cover: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=280&fit=crop&auto=format",
    notes: "Absolutely gripping. The science feels real and the protagonist is charming.",
    quotes: ["Science is the belief in the ignorance of experts."],
    favorite: true, dateAdded: "2024-03-15", publishedYear: 2021,
  },
  {
    id: "9", title: "The Alchemist", author: "Paulo Coelho",
    isbn: "978-0062315007", category: "Fiction", genre: "Philosophical Fiction",
    status: "not-started", rating: 0, progress: 0, totalPages: 208, currentPage: 0,
    cover: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=200&h=280&fit=crop&auto=format",
    notes: "", quotes: [],
    favorite: false, dateAdded: "2024-03-20", publishedYear: 1988,
  },
  {
    id: "10", title: "Deep Work", author: "Cal Newport",
    isbn: "978-1455586691", category: "Self-Help", genre: "Productivity",
    status: "completed", rating: 4, progress: 100, totalPages: 296, currentPage: 296,
    cover: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200&h=280&fit=crop&auto=format",
    notes: "Changed how I structure my work day. The 4DX framework is practical.",
    quotes: ["A deep life is a good life."],
    favorite: false, dateAdded: "2023-12-05", publishedYear: 2016,
  },
  {
    id: "11", title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams",
    isbn: "978-0345391803", category: "Fiction", genre: "Comedy / Sci-Fi",
    status: "wishlist", rating: 0, progress: 0, totalPages: 224, currentPage: 0,
    cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&h=280&fit=crop&auto=format",
    notes: "", quotes: [],
    favorite: false, dateAdded: "2024-03-22", publishedYear: 1979,
  },
  {
    id: "12", title: "Educated", author: "Tara Westover",
    isbn: "978-0399590504", category: "Memoir", genre: "Biography",
    status: "completed", rating: 5, progress: 100, totalPages: 334, currentPage: 334,
    cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=280&fit=crop&auto=format",
    notes: "Powerful memoir about education as transformation. Heartbreaking and hopeful.",
    quotes: ["You can love someone and still choose to say goodbye to them."],
    favorite: true, dateAdded: "2024-02-28", publishedYear: 2018,
  },
  {
    id: "13", title: "The Design of Everyday Things", author: "Don Norman",
    isbn: "978-0465050659", category: "Design", genre: "UX / Product Design",
    status: "reading", rating: 4, progress: 55, totalPages: 368, currentPage: 202,
    cover: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&h=280&fit=crop&auto=format",
    notes: "Every interaction should be intuitive. Affordances and signifiers explained clearly.",
    quotes: ["Good design is actually a lot harder to notice than poor design."],
    favorite: false, dateAdded: "2024-03-08", publishedYear: 2013,
  },
  {
    id: "14", title: "Meditations", author: "Marcus Aurelius",
    isbn: "978-0140449334", category: "Philosophy", genre: "Stoicism",
    status: "wishlist", rating: 0, progress: 0, totalPages: 254, currentPage: 0,
    cover: "https://images.unsplash.com/photo-1482160310021-8aba6ef7ec06?w=200&h=280&fit=crop&auto=format",
    notes: "", quotes: [],
    favorite: false, dateAdded: "2024-03-25", publishedYear: 161,
  },
  {
    id: "15", title: "The Great Gatsby", author: "F. Scott Fitzgerald",
    isbn: "978-0743273565", category: "Fiction", genre: "Literary Fiction",
    status: "completed", rating: 4, progress: 100, totalPages: 180, currentPage: 180,
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=200&h=280&fit=crop&auto=format",
    notes: "The green light symbolism is beautiful. The American Dream explored perfectly.",
    quotes: ["So we beat on, boats against the current, borne back ceaselessly into the past."],
    favorite: false, dateAdded: "2023-10-15", publishedYear: 1925,
  },
];

const MONTHLY_STATS = [
  { month: "Sep", books: 2, pages: 652 },
  { month: "Oct", books: 3, pages: 893 },
  { month: "Nov", books: 1, pages: 499 },
  { month: "Dec", books: 2, pages: 476 },
  { month: "Jan", books: 3, pages: 981 },
  { month: "Feb", books: 4, pages: 1284 },
  { month: "Mar", books: 3, pages: 917 },
];

const GENRE_DATA = [
  { name: "Fiction", value: 6, color: "#4F46E5" },
  { name: "Technology", value: 3, color: "#10B981" },
  { name: "Self-Help", value: 2, color: "#F59E0B" },
  { name: "Non-Fiction", value: 1, color: "#8B5CF6" },
  { name: "Psychology", value: 1, color: "#EF4444" },
  { name: "Other", value: 2, color: "#EC4899" },
];

const READING_TREND = [
  { week: "W1", minutes: 120 },
  { week: "W2", minutes: 185 },
  { week: "W3", minutes: 95 },
  { week: "W4", minutes: 220 },
  { week: "W5", minutes: 310 },
  { week: "W6", minutes: 275 },
  { week: "W7", minutes: 340 },
  { week: "W8", minutes: 290 },
];

const CATEGORIES = ["Fiction", "Non-Fiction", "Technology", "Self-Help", "Psychology", "Memoir", "Design", "Philosophy", "History", "Science"];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "library", label: "My Library", icon: Library },
  { id: "wishlist", label: "Wishlist", icon: Bookmark },
  { id: "goals", label: "Reading Goals", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Recommendations", icon: Sparkles, comingSoon: true },
];

const NAV_BOTTOM = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function statusConfig(status: ReadingStatus) {
  const map = {
    reading: { label: "Reading", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    completed: { label: "Completed", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    paused: { label: "Paused", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    wishlist: { label: "Wishlist", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
    "not-started": { label: "Not Started", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  };
  return map[status];
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Fiction: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400",
    "Non-Fiction": "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
    Technology: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
    "Self-Help": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    Psychology: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
    Memoir: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    Design: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
    Philosophy: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    History: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    Science: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  };
  return map[cat] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReadingStatus }) {
  const s = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor(category)}`}>
      {category}
    </span>
  );
}

function StarRating({ rating, onRate, size = "sm" }: { rating: number; onRate?: (r: number) => void; size?: "sm" | "md" }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onRate?.(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className={`${onRate ? "cursor-pointer" : "cursor-default"} transition-colors`}
        >
          <Star
            className={`${sz} ${(hovered || rating) >= n ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ value, color = "primary" }: { value: number; color?: "primary" | "emerald" | "amber" }) {
  const colorMap = { primary: "bg-primary", emerald: "bg-emerald-500", amber: "bg-amber-500" };
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Btn({
  variant = "primary", size = "md", children, onClick, className = "", type = "button", disabled = false
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border border-border text-foreground hover:bg-muted",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text", required = false, rows
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; rows?: number;
}) {
  const cls = "w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      {rows ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows} required={required}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} required={required} className={cls}
        />
      )}
    </div>
  );
}

function Select({
  label, value, onChange, options, required = false
}: {
  label?: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)} required={required}
          className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none pr-10"
        >
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300"}`}>
      {type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onCancel} className="flex-1">Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm} className="flex-1">Delete</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book, viewMode, onView, onEdit, onDelete, onToggleFavorite }: {
  book: Book; viewMode: "grid" | "list";
  onView: () => void; onEdit: () => void; onDelete: () => void; onToggleFavorite: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = statusConfig(book.status);

  if (viewMode === "list") {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">{book.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={book.status} />
              <CategoryBadge category={book.category} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <StarRating rating={book.rating} />
            {book.status === "reading" && (
              <div className="flex items-center gap-2 flex-1 max-w-32">
                <ProgressBar value={book.progress} />
                <span className="text-xs text-muted-foreground">{book.progress}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onToggleFavorite} className={`p-2 rounded-lg hover:bg-muted transition-colors ${book.favorite ? "text-rose-500" : "text-muted-foreground"}`}>
            <Heart className={`w-4 h-4 ${book.favorite ? "fill-rose-500" : ""}`} />
          </button>
          <button onClick={onView} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Eye className="w-4 h-4" /></button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-muted transition-colors text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={onView}>
      <div className="relative">
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors
            ${book.favorite ? "bg-rose-500 text-white" : "bg-black/30 text-white hover:bg-rose-500"}`}
        >
          <Heart className={`w-4 h-4 ${book.favorite ? "fill-white" : ""}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={book.status} />
        </div>
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">{book.title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{book.author}</p>
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={book.category} />
          <StarRating rating={book.rating} />
        </div>
        {book.status === "reading" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span><span>{book.progress}%</span>
            </div>
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentPage, onNavigate, isMobileOpen, onMobileClose, onLogout }: {
  currentPage: Page; onNavigate: (p: Page) => void;
  isMobileOpen: boolean; onMobileClose: () => void; onLogout: () => void;
}) {
  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onMobileClose} />
      )}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-30 flex flex-col
        transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-sidebar-foreground">BookNest</span>
              <p className="text-xs text-muted-foreground">Personal Library</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { if (!item.comingSoon) { onNavigate(item.id as Page); onMobileClose(); } }}
                disabled={item.comingSoon}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                  ${item.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.comingSoon && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                    SOON
                  </span>
                )}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          {NAV_BOTTOM.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id as Page); onMobileClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ isDark, onToggleDark, onMobileMenuOpen, searchQuery, onSearch }: {
  isDark: boolean; onToggleDark: () => void; onMobileMenuOpen: () => void;
  searchQuery: string; onSearch: (q: string) => void;
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  return (
    <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-4 lg:px-6">
      <button onClick={onMobileMenuOpen} className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search books, authors…"
          className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
              </div>
              {[
                { msg: "You've read 3 books this month!", time: "2h ago", color: "bg-emerald-500" },
                { msg: "Reading streak: 7 days! Keep it up.", time: "1d ago", color: "bg-amber-500" },
                { msg: "Monthly goal: 75% complete.", time: "3d ago", color: "bg-primary" },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`} />
                  <div>
                    <p className="text-xs text-foreground">{n.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onToggleDark}
          className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-border ml-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground">Alex Rivera</p>
            <p className="text-xs text-muted-foreground">avid reader</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold">AR</div>
        </div>
      </div>
    </header>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") { setSubmitted(true); return; }
    onAuth();
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=1200&fit=crop&auto=format"
          alt="Cozy library with books"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-indigo-900/70 to-black/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">BookNest</span>
          </div>
          <div>
            <blockquote className="text-2xl font-bold leading-tight mb-4">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </blockquote>
            <cite className="text-white/70 text-sm">— George R.R. Martin</cite>
            <div className="flex gap-6 mt-8">
              {[["2,400+", "Books Tracked"], ["15K+", "Readers"], ["4.9★", "Rating"]].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-white/70 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookNest</span>
          </div>

          {mode === "forgot" && submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">We've sent a reset link to <strong>{email}</strong></p>
              <Btn variant="ghost" onClick={() => { setMode("signin"); setSubmitted(false); }}>Back to Sign In</Btn>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {mode === "signin" ? "Sign in to your personal library"
                  : mode === "signup" ? "Start tracking your reading journey"
                  : "Enter your email to receive a reset link"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && <Input label="Full Name" value={name} onChange={setName} placeholder="Alex Rivera" required />}
                <Input label="Email Address" value={email} onChange={setEmail} placeholder="alex@example.com" type="email" required />
                {mode !== "forgot" && <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />}

                {mode === "signin" && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode("forgot")} className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Btn type="submit" size="lg" className="w-full justify-center mt-2">
                  {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight className="w-4 h-4" />
                </Btn>
              </form>

              {mode !== "forgot" && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "signin" ? (
                    <>Don't have an account?{" "}
                      <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Sign up</button>
                    </>
                  ) : (
                    <>Already have an account?{" "}
                      <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
                    </>
                  )}
                </div>
              )}

              {mode === "forgot" && (
                <div className="mt-4 text-center">
                  <button onClick={() => setMode("signin")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ books, onNavigate, onView }: { books: Book[]; onNavigate: (p: Page) => void; onView: (b: Book) => void }) {
  const total = books.length;
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const wishlist = books.filter((b) => b.status === "wishlist").length;
  const recent = [...books].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 4);
  const monthlyGoal = 4;
  const monthlyRead = 3;
  const streak = 7;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Alex 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your reading journey.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{streak} day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={total} sub="in your library" icon={Library} color="bg-primary" />
        <StatCard label="Books Read" value={completed} sub="all time" icon={Check} color="bg-emerald-500" />
        <StatCard label="Currently Reading" value={reading} sub="in progress" icon={BookOpen} color="bg-blue-500" />
        <StatCard label="Wishlist" value={wishlist} sub="books to read" icon={Bookmark} color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground">Reading Activity</h3>
            <span className="text-xs text-muted-foreground">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_STATS}>
              <defs>
                <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Area type="monotone" dataKey="books" stroke="#4F46E5" strokeWidth={2} fill="url(#colorBooks)" name="Books" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-5">By Genre</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GENRE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {GENRE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {GENRE_DATA.slice(0, 4).map((g) => (
              <div key={g.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                  <span className="text-muted-foreground">{g.name}</span>
                </div>
                <span className="font-medium text-foreground">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recently Added</h3>
            <button onClick={() => onNavigate("library")} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((book) => (
              <div
                key={book.id}
                onClick={() => onView(book)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-10 h-13 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                </div>
                <StatusBadge status={book.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground">Monthly Goal</h3>
          <div className="text-center py-2">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#4F46E5" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - monthlyRead / monthlyGoal)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{monthlyRead}</span>
                <span className="text-xs text-muted-foreground">of {monthlyGoal}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Books this month</p>
            <p className="text-xs text-primary font-medium">{Math.round(monthlyRead / monthlyGoal * 100)}% complete</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" size="sm" onClick={() => onNavigate("add-book")} className="flex-1 justify-center">
              <Plus className="w-3.5 h-3.5" /> Add Book
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => onNavigate("goals")} className="flex-1 justify-center">
              <Target className="w-3.5 h-3.5" /> Goals
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Library Page ─────────────────────────────────────────────────────────────

function LibraryPage({ books, onView, onEdit, onDelete, onAdd, onToggleFavorite }: {
  books: Book[]; onView: (b: Book) => void; onEdit: (b: Book) => void;
  onDelete: (b: Book) => void; onAdd: () => void; onToggleFavorite: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");

  const filtered = books
    .filter((b) => b.status !== "wishlist")
    .filter((b) => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
    .filter((b) => !filterCat || b.category === filterCat)
    .filter((b) => !filterStatus || b.status === filterStatus)
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
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} books</p>
        </div>
        <Btn onClick={onAdd}>
          <Plus className="w-4 h-4" /> Add Book
        </Btn>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library…"
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Status</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="not-started">Not Started</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="dateAdded">Newest First</option>
              <option value="title">Title A–Z</option>
              <option value="rating">Top Rated</option>
              <option value="progress">Most Progress</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="flex items-center bg-input-background border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No books found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} viewMode="grid"
              onView={() => onView(book)} onEdit={() => onEdit(book)}
              onDelete={() => onDelete(book)} onToggleFavorite={() => onToggleFavorite(book.id)} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} viewMode="list"
              onView={() => onView(book)} onEdit={() => onEdit(book)}
              onDelete={() => onDelete(book)} onToggleFavorite={() => onToggleFavorite(book.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Book Detail Page ─────────────────────────────────────────────────────────

function BookDetailPage({ book, onBack, onEdit, onDelete, onToggleFavorite }: {
  book: Book; onBack: () => void; onEdit: () => void;
  onDelete: () => void; onToggleFavorite: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <div className="max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-muted aspect-[2/3] shadow-lg">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={book.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <CategoryBadge category={book.category} />
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Rating</span>
              <StarRating rating={book.rating} size="md" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-foreground">{book.publishedYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ISBN</span>
              <span className="text-xs font-mono text-muted-foreground">{book.isbn}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={onEdit} className="flex-1 justify-center" size="sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Btn>
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${book.favorite ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30 dark:border-rose-800" : "border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"}`}
            >
              <Heart className={`w-4 h-4 ${book.favorite ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{book.author}</p>
            <div className="flex items-center gap-2 mt-3">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{book.genre}</span>
            </div>
          </div>

          {book.status === "reading" && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Reading Progress</h3>
                <span className="text-sm font-bold text-primary">{book.progress}%</span>
              </div>
              <ProgressBar value={book.progress} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Page {book.currentPage} of {book.totalPages}</span>
                <span>{book.totalPages - book.currentPage} pages remaining</span>
              </div>
            </div>
          )}

          {book.notes && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Personal Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{book.notes}</p>
            </div>
          )}

          {book.quotes.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Favorite Quotes</h3>
              </div>
              <div className="space-y-3">
                {book.quotes.map((q, i) => (
                  <blockquote key={i} className="pl-4 border-l-2 border-primary/30 text-sm text-muted-foreground italic">
                    "{q}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {!book.notes && book.quotes.length === 0 && (
            <div className="bg-muted/50 border border-border rounded-2xl p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes or quotes yet.</p>
              <Btn variant="ghost" size="sm" onClick={onEdit} className="mt-2">Add notes</Btn>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Book"
          message={`Are you sure you want to remove "${book.title}" from your library? This action cannot be undone.`}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── Add / Edit Book Page ─────────────────────────────────────────────────────

function AddBookPage({ book, onSave, onCancel }: {
  book?: Book; onSave: (data: Partial<Book>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: book?.title || "",
    author: book?.author || "",
    isbn: book?.isbn || "",
    category: book?.category || "",
    genre: book?.genre || "",
    status: (book?.status || "not-started") as ReadingStatus,
    rating: book?.rating || 0,
    totalPages: String(book?.totalPages || ""),
    currentPage: String(book?.currentPage || ""),
    notes: book?.notes || "",
    quotes: book?.quotes.join("\n") || "",
    publishedYear: String(book?.publishedYear || ""),
  });

  const isEdit = !!book;
  const progress = form.totalPages && form.currentPage
    ? Math.round(Number(form.currentPage) / Number(form.totalPages) * 100) : 0;

  function f(field: string) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      rating: form.rating,
      totalPages: Number(form.totalPages) || 0,
      currentPage: Number(form.currentPage) || 0,
      progress,
      publishedYear: Number(form.publishedYear) || 0,
      quotes: form.quotes.split("\n").filter(Boolean),
      cover: book?.cover || `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format`,
    });
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {isEdit ? "Back to Book" : "Back to Library"}
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">{isEdit ? "Edit Book" : "Add New Book"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">Book Information</h3>
          <div className="flex items-start gap-5">
            <div className="w-24 h-32 bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors flex-shrink-0">
              <Camera className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Cover</span>
            </div>
            <div className="flex-1 space-y-4">
              <Input label="Book Title" value={form.title} onChange={f("title")} placeholder="The Great Gatsby" required />
              <Input label="Author" value={form.author} onChange={f("author")} placeholder="F. Scott Fitzgerald" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ISBN" value={form.isbn} onChange={f("isbn")} placeholder="978-0-000-00000-0" />
            <Input label="Published Year" value={form.publishedYear} onChange={f("publishedYear")} placeholder="2024" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={f("category")} options={CATEGORIES} required />
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

// ─── Wishlist Page ────────────────────────────────────────────────────────────

function WishlistPage({ books, onMoveToLibrary, onDelete, onAdd }: {
  books: Book[]; onMoveToLibrary: (id: string) => void; onDelete: (b: Book) => void; onAdd: () => void;
}) {
  const wishlist = books.filter((b) => b.status === "wishlist");
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{wishlist.length} books to read</p>
        </div>
        <Btn onClick={onAdd}><Plus className="w-4 h-4" /> Add to Wishlist</Btn>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">Add books you want to read next</p>
          <Btn onClick={onAdd}><Plus className="w-4 h-4" /> Add First Book</Btn>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((book) => (
            <div key={book.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="flex gap-4 p-4">
                <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                  <CategoryBadge category={book.category} />
                  <p className="text-xs text-muted-foreground mt-2">{book.totalPages} pages · {book.publishedYear}</p>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <Btn variant="primary" size="sm" onClick={() => onMoveToLibrary(book.id)} className="flex-1 justify-center">
                  <BookOpen className="w-3.5 h-3.5" /> Start Reading
                </Btn>
                <button
                  onClick={() => onDelete(book)}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reading Goals Page ───────────────────────────────────────────────────────

function GoalsPage({ books }: { books: Book[] }) {
  const completed = books.filter((b) => b.status === "completed").length;
  const yearlyGoal = 24;
  const monthlyGoal = 4;
  const monthlyRead = 3;

  const milestones = [
    { label: "First Book", target: 1, completed: completed >= 1 },
    { label: "5 Books", target: 5, completed: completed >= 5 },
    { label: "10 Books", target: 10, completed: completed >= 10 },
    { label: "Halfway to Yearly Goal", target: 12, completed: completed >= 12 },
    { label: "Yearly Goal Complete", target: 24, completed: completed >= 24 },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reading Goals</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Track your reading targets and milestones</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">2024 Yearly Goal</p>
              <p className="text-3xl font-bold text-foreground mt-1">{completed} <span className="text-muted-foreground text-lg font-medium">/ {yearlyGoal}</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
          <ProgressBar value={Math.round(completed / yearlyGoal * 100)} />
          <p className="text-xs text-muted-foreground mt-2">{Math.round(completed / yearlyGoal * 100)}% complete · {yearlyGoal - completed} books to go</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">July Goal</p>
              <p className="text-3xl font-bold text-foreground mt-1">{monthlyRead} <span className="text-muted-foreground text-lg font-medium">/ {monthlyGoal}</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <ProgressBar value={Math.round(monthlyRead / monthlyGoal * 100)} color="emerald" />
          <p className="text-xs text-muted-foreground mt-2">{Math.round(monthlyRead / monthlyGoal * 100)}% complete · {monthlyGoal - monthlyRead} more this month</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Monthly Progress</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MONTHLY_STATS}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            <Bar dataKey="books" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Books Read" />
            <Bar dataKey="" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                ${m.completed ? "bg-emerald-500 text-white" : "bg-muted border-2 border-border text-muted-foreground"}`}>
                {m.completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{m.target}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${m.completed ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.target} books</p>
              </div>
              {m.completed && <span className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">Achieved!</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

function AnalyticsPage({ books }: { books: Book[] }) {
  const completed = books.filter((b) => b.status === "completed").length;
  const totalPages = books.reduce((sum, b) => sum + b.currentPage, 0);
  const avgRating = (books.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / books.filter(b => b.rating > 0).length).toFixed(1);
  const favCount = books.filter((b) => b.favorite).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Deep dive into your reading habits</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Books Completed" value={completed} icon={Award} color="bg-primary" />
        <StatCard label="Pages Read" value={totalPages.toLocaleString()} sub="total pages" icon={FileText} color="bg-emerald-500" />
        <StatCard label="Avg. Rating" value={`${avgRating}★`} sub="across all rated" icon={Star} color="bg-amber-500" />
        <StatCard label="Favorites" value={favCount} sub="books loved" icon={Heart} color="bg-rose-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-5">Books Per Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="books" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Books" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-5">Reading Time Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={READING_TREND}>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => [`${v} min`, "Reading Time"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="minutes" stroke="#10B981" strokeWidth={2} fill="url(#grad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-5">Genre Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={GENRE_DATA} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {GENRE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {GENRE_DATA.map((g) => (
              <div key={g.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                <span className="text-muted-foreground truncate">{g.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Reading Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Books This Month", value: "3", change: "+50%", up: true },
              { label: "Avg. Pages/Day", value: "28", change: "+12%", up: true },
              { label: "Completion Rate", value: "76%", change: "-5%", up: false },
              { label: "Streak Record", value: "14 days", change: "Personal best", up: true },
              { label: "Fastest Read", value: "3 days", change: "Atomic Habits", up: true },
              { label: "Favorite Author", value: "Various", change: "Sci-Fi dominant", up: true },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className={`text-xs font-medium mt-1 ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{s.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage() {
  const [name, setName] = useState("Alex Rivera");
  const [bio, setBio] = useState("Avid reader, tech enthusiast, coffee lover. Currently building a 100-book library.");
  const [email, setEmail] = useState("alex.rivera@example.com");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Personal Information</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-md">AR</div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors">
              <Camera className="w-3.5 h-3.5 text-foreground" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Member since January 2024</p>
          </div>
        </div>
        <div className="grid gap-4">
          <Input label="Full Name" value={name} onChange={setName} />
          <Input label="Email Address" value={email} onChange={setEmail} type="email" />
          <Input label="Bio" value={bio} onChange={setBio} rows={3} placeholder="Tell us about yourself…" />
        </div>
        <Btn onClick={save} variant={saved ? "secondary" : "primary"}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
        </Btn>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Change Password</h3>
        <div className="grid gap-4">
          <Input label="Current Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
          <Input label="New Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </div>
        <Btn variant="outline">Update Password</Btn>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Reading Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          {[["15", "Books Read"], ["7", "Day Streak"], ["4.2★", "Avg Rating"]].map(([v, l]) => (
            <div key={l} className="text-center bg-muted/50 rounded-xl py-4">
              <p className="text-2xl font-bold text-foreground">{v}</p>
              <p className="text-xs text-muted-foreground mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: () => void }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-primary" : "bg-switch-background"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    );
  }

  function Row({ icon: Icon, label, sub, action }: { icon: React.ElementType; label: string; sub?: string; action: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="bg-card border border-border rounded-2xl p-5 divide-y divide-border">
        <h3 className="font-semibold text-foreground pb-3">Appearance</h3>
        <Row icon={isDark ? Moon : Sun} label="Dark Mode" sub="Toggle between light and dark theme"
          action={<Toggle on={isDark} onChange={onToggleDark} />} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 divide-y divide-border">
        <h3 className="font-semibold text-foreground pb-3">Notifications</h3>
        <Row icon={Bell} label="Email Notifications" sub="Weekly reading summary emails"
          action={<Toggle on={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />} />
        <Row icon={Target} label="Goal Reminders" sub="Alerts when nearing monthly goals"
          action={<Toggle on={goalReminders} onChange={() => setGoalReminders(!goalReminders)} />} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 divide-y divide-border">
        <h3 className="font-semibold text-foreground pb-3">Privacy</h3>
        <Row icon={Shield} label="Public Profile" sub="Let others discover your reading list"
          action={<Toggle on={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />} />
        <Row icon={Lock} label="Two-Factor Authentication" sub="Extra security for your account"
          action={<Btn variant="outline" size="sm">Enable</Btn>} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 divide-y divide-border">
        <h3 className="font-semibold text-foreground pb-3">Data</h3>
        <Row icon={Download} label="Export Library" sub="Download your books as JSON or CSV"
          action={<Btn variant="outline" size="sm"><Download className="w-3.5 h-3.5" /> Export</Btn>} />
        <Row icon={Trash2} label="Delete Account" sub="Permanently remove your account and data"
          action={<Btn variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Btn>} />
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Account"
          message="This will permanently delete your account and all library data. This cannot be undone."
          onConfirm={() => setShowDeleteConfirm(false)}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>("library");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
  }

  function navigate(page: Page) {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
  }

  function handleViewBook(book: Book) {
    setSelectedBook(book);
    setPreviousPage(currentPage);
    navigate("book-detail");
  }

  function handleEditBook(book: Book) {
    setEditingBook(book);
    setSelectedBook(book);
    navigate("edit-book");
  }

  function handleDeleteBook(book: Book) {
    setDeleteTarget(book);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setBooks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    showToast(`"${deleteTarget.title}" removed from library`);
    setDeleteTarget(null);
    if (currentPage === "book-detail") navigate("library");
  }

  function handleToggleFavorite(id: string) {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, favorite: !b.favorite } : b));
    const book = books.find((b) => b.id === id);
    if (book) showToast(book.favorite ? "Removed from favorites" : "Added to favorites");
  }

  function handleSaveBook(data: Partial<Book>) {
    if (editingBook) {
      setBooks((prev) => prev.map((b) => b.id === editingBook.id ? { ...b, ...data } : b));
      showToast("Book updated successfully");
      setEditingBook(null);
      navigate("library");
    } else {
      const newBook: Book = {
        id: Date.now().toString(),
        title: "", author: "", isbn: "", category: "", genre: "",
        status: "not-started", rating: 0, progress: 0, totalPages: 0, currentPage: 0,
        cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format",
        notes: "", quotes: [], favorite: false,
        dateAdded: new Date().toISOString().split("T")[0],
        publishedYear: new Date().getFullYear(),
        ...data,
      };
      setBooks((prev) => [newBook, ...prev]);
      showToast("Book added to library!");
      navigate("library");
    }
  }

  function handleMoveToLibrary(id: string) {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, status: "not-started" as ReadingStatus } : b));
    showToast("Book moved to library!");
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onAuth={() => setIsAuthenticated(true)} />
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage books={books} onNavigate={navigate} onView={handleViewBook} />;
      case "library":
        return (
          <LibraryPage
            books={books}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onAdd={() => { setEditingBook(null); navigate("add-book"); }}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "book-detail":
        return selectedBook ? (
          <BookDetailPage
            book={books.find((b) => b.id === selectedBook.id) || selectedBook}
            onBack={() => navigate(previousPage)}
            onEdit={() => handleEditBook(selectedBook)}
            onDelete={() => handleDeleteBook(selectedBook)}
            onToggleFavorite={() => handleToggleFavorite(selectedBook.id)}
          />
        ) : null;
      case "add-book":
        return <AddBookPage onSave={handleSaveBook} onCancel={() => navigate("library")} />;
      case "edit-book":
        return editingBook ? (
          <AddBookPage
            book={editingBook}
            onSave={handleSaveBook}
            onCancel={() => navigate(selectedBook ? "book-detail" : "library")}
          />
        ) : null;
      case "wishlist":
        return (
          <WishlistPage
            books={books}
            onMoveToLibrary={handleMoveToLibrary}
            onDelete={handleDeleteBook}
            onAdd={() => { setEditingBook(null); navigate("add-book"); }}
          />
        );
      case "goals":
        return <GoalsPage books={books} />;
      case "analytics":
        return <AnalyticsPage books={books} />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onLogout={() => setIsAuthenticated(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Book"
          message={`Remove "${deleteTarget.title}" from your library? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
