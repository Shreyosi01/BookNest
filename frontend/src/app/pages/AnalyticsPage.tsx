import { Activity, BookOpen, TrendingUp } from "lucide-react";
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Book } from "../types";
import { ProgressBar } from "./pageHelpers";

interface AnalyticsPageProps {
  books: Book[];
}

const STATS = [
  { month: "Jan", pages: 320 },
  { month: "Feb", pages: 580 },
  { month: "Mar", pages: 720 },
  { month: "Apr", pages: 1040 },
  { month: "May", pages: 940 },
  { month: "Jun", pages: 1280 },
];

export default function AnalyticsPage({ books }: AnalyticsPageProps) {
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const totalPages = books.reduce((sum, b) => sum + b.totalPages, 0);
  const avgRating = books.length ? (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Understand your reading habits and progress</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completed}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Books finished this year</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Reading Now</p>
              <p className="text-2xl font-bold text-foreground">{reading}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--chart-4) 15%, transparent)", color: "var(--chart-4)" }}
            >
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Active reading goals</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Rating</p>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Average book rating</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Reading Trend</h3>
          <span className="text-sm text-muted-foreground">{totalPages} total pages</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={STATS}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            <Line type="monotone" dataKey="pages" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Reading Consistency</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">Weekly Reading</span>
              <span className="text-muted-foreground">78%</span>
            </div>
            <ProgressBar value={78} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">Book Completion</span>
              <span className="text-muted-foreground">{Math.round(completed / Math.max(1, books.length) * 100)}%</span>
            </div>
            <ProgressBar value={Math.round(completed / Math.max(1, books.length) * 100)} color="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
}