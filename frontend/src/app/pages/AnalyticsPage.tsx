import { Activity, BookOpen, TrendingUp } from "lucide-react";

import type { Book } from "../types";
import { ProgressBar } from "./pageHelpers";

interface AnalyticsPageProps {
  books: Book[];
}

export default function AnalyticsPage({ books }: AnalyticsPageProps) {
  const completed = books.filter((b) => b.status === "completed").length;
  const reading = books.filter((b) => b.status === "reading");
  const totalPages = books.reduce((sum, b) => sum + b.totalPages, 0);
  const avgRating = books.length ? (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1) : "0.0";
  const completionRate = Math.round((completed / Math.max(1, books.length)) * 100);

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
              <p className="text-2xl font-bold text-foreground">{reading.length}</p>
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
          <h3 className="font-bold text-foreground">Currently Reading</h3>
          <span className="text-sm text-muted-foreground">{totalPages} total pages across your library</span>
        </div>

        {reading.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nothing in progress right now — start a book to see it here.
          </p>
        ) : (
          <div className="space-y-4">
            {reading.map((book) => {
              const pct = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
              return (
                <div key={book.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium truncate pr-2">{book.title}</span>
                    <span className="text-muted-foreground flex-shrink-0">
                      {book.currentPage} / {book.totalPages} pages
                    </span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Completion Rate</h3>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground">Books completed vs. total library</span>
            <span className="text-muted-foreground">{completionRate}%</span>
          </div>
          <ProgressBar value={completionRate} color="emerald" />
        </div>
      </div>
    </div>
  );
}