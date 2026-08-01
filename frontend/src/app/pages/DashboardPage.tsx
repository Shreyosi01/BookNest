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
}

export default function DashboardPage({
  books = [],
  onNavigate = () => {},
  onView = () => {},
}: DashboardPageProps) {
  const total = books.length;
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const wishlist = books.filter((b) => b.status === "wishlist").length;

  const recent = [...books]
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
    .slice(0, 4);

  const monthlyGoal = 4;
  const monthlyRead = 3;
  const streak = 7;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, Alex 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your reading journey.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
          <Flame className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {streak} day streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Books"
          value={total}
          sub="in your library"
          icon={Library}
          color="bg-primary"
        />

        <StatCard
          label="Books Read"
          value={completed}
          sub="all time"
          icon={Check}
          color="bg-emerald-500"
        />

        <StatCard
          label="Currently Reading"
          value={reading}
          sub="in progress"
          icon={BookOpen}
          color="bg-blue-500"
        />

        <StatCard
          label="Wishlist"
          value={wishlist}
          sub="books to read"
          icon={Bookmark}
          color="bg-purple-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-bold text-foreground">Reading Activity</h3>
            <span className="text-xs text-muted-foreground">
              Last 7 months
            </span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_STATS}>
              <defs>
                <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="books"
                stroke="#4F46E5"
                fill="url(#colorBooks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-5 font-bold text-foreground">By Genre</h3>

          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={GENRE_DATA}
                dataKey="value"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {GENRE_DATA.map((genre) => (
                  <Cell key={genre.name} fill={genre.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-2 space-y-2">
            {GENRE_DATA.slice(0, 4).map((genre) => (
              <div
                key={genre.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: genre.color }}
                  />
                  <span className="text-muted-foreground">
                    {genre.name}
                  </span>
                </div>

                <span className="font-medium">{genre.value}</span>
              </div>
            ))}
          </div>
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

          <div className="space-y-3">
            {recent.map((book) => (
              <div
                key={book.id}
                onClick={() => onView(book)}
                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition hover:bg-muted"
              >
                <div className="h-14 w-10 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {book.title}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </p>
                </div>

                <StatusBadge status={book.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-bold">Monthly Goal</h3>

          <div className="py-2 text-center">
            <div className="relative mx-auto h-32 w-32">
              <svg
                className="-rotate-90 h-32 w-32"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={
                    2 * Math.PI * 50 * (1 - monthlyRead / monthlyGoal)
                  }
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">
                  {monthlyRead}
                </span>

                <span className="text-xs">
                  of {monthlyGoal}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Books this month
            </p>

            <p className="text-xs font-medium text-primary">
              {Math.round((monthlyRead / monthlyGoal) * 100)}% complete
            </p>
          </div>

          <div className="flex gap-2">
            <Btn
              variant="primary"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => onNavigate("add-book")}
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Btn>

            <Btn
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => onNavigate("goals")}
            >
              <Target className="h-4 w-4" />
              Goals
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

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