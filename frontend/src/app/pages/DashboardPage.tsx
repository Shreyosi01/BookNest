import {
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Flame,
  Library,
  Plus,
  Target,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Btn from "../components/common/Btn";
import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";

import type { Book, Page } from "../types";

interface DashboardPageProps {
  books?: Book[];
  onNavigate?: (page: Page) => void;
  onView?: (book: Book) => void;
  userName?: string;
  streak?: number;
}

const CHART_PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const MONTHLY_GOAL = 4; // no goal-setting UI yet, so this stays a fixed target for now

function lastNMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-US", { month: "short" }) };
  });
}

function computeMonthlyCompletions(books: Book[]) {
  const months = lastNMonths(7);
  const counts = new Map(months.map((m) => [m.key, 0]));
  books.forEach((b) => {
    if (!b.completedAt) return;
    const d = new Date(b.completedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return months.map((m) => ({ month: m.label, books: counts.get(m.key) ?? 0 }));
}

function computeGenreDistribution(books: Book[]) {
  const counts = new Map<string, number>();
  books.forEach((b) => {
    const cat = b.category || "Uncategorized";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: CHART_PALETTE[i % CHART_PALETTE.length] }));
}

export default function DashboardPage({
  books = [],
  onNavigate = () => {},
  onView = () => {},
  userName = "Reader",
  streak = 0,
}: DashboardPageProps) {
  const total = books.length;
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const wishlist = books.filter((b) => b.status === "wishlist").length;

  const recent = [...books]
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
    .slice(0, 4);

  const now = new Date();
  const monthlyRead = books.filter((b) => {
    if (!b.completedAt) return false;
    const d = new Date(b.completedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const monthlyStats = computeMonthlyCompletions(books);
  const genreData = computeGenreDistribution(books);
  const firstName = userName.trim().split(/\s+/)[0] || "Reader";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, {firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your reading journey.
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
        >
          <Flame className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            {streak} day streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Books" value={total} sub="in your library" icon={Library} color="var(--chart-1)" />
        <StatCard label="Books Read" value={completed} sub="all time" icon={Check} color="var(--chart-4)" />
        <StatCard
          label="Currently Reading"
          value={reading}
          sub="in progress"
          icon={BookOpen}
          color="var(--chart-2)"
          iconColor="var(--accent-foreground)"
        />
        <StatCard label="Wishlist" value={wishlist} sub="books to read" icon={Bookmark} color="var(--chart-5)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-bold text-foreground">Reading Activity</h3>
            <span className="text-xs text-muted-foreground">Last 7 months</span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyStats}>
              <defs>
                <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
              />
              <Area type="monotone" dataKey="books" stroke="var(--primary)" fill="url(#colorBooks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          {monthlyStats.every((m) => m.books === 0) && (
            <p className="text-xs text-muted-foreground text-center -mt-4">
              Finish a book to see your activity here.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-5 font-bold text-foreground">By Genre</h3>

          {genreData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Add a book to see your genre mix.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={genreData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {genreData.map((genre) => (
                      <Cell key={genre.name} fill={genre.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-2 space-y-2">
                {genreData.slice(0, 4).map((genre) => (
                  <div key={genre.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: genre.color }} />
                      <span className="text-muted-foreground">{genre.name}</span>
                    </div>
                    <span className="font-medium">{genre.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Recently Added</h3>
            <button
              onClick={() => onNavigate("library")}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nothing here yet — add your first book.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onView(book)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition hover:bg-muted"
                >
                  <div className="h-14 w-10 overflow-hidden rounded-lg bg-muted">
                    <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{book.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <StatusBadge status={book.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-bold">Monthly Goal</h3>

          <div className="py-2 text-center">
            <div className="relative mx-auto h-32 w-32">
              <svg className="-rotate-90 h-32 w-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(1, monthlyRead / MONTHLY_GOAL))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{monthlyRead}</span>
                <span className="text-xs">of {MONTHLY_GOAL}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Books this month</p>
            <p className="text-xs font-medium text-primary">
              {Math.round((monthlyRead / MONTHLY_GOAL) * 100)}% complete
            </p>
          </div>

          <div className="flex gap-2">
            <Btn variant="primary" size="sm" className="flex-1 justify-center" onClick={() => onNavigate("add-book")}>
              <Plus className="h-4 w-4" />
              Add Book
            </Btn>
            <Btn variant="outline" size="sm" className="flex-1 justify-center" onClick={() => onNavigate("goals")}>
              <Target className="h-4 w-4" />
              Goals
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}