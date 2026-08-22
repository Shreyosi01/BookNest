import { Award, Calendar, Check } from "lucide-react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Book } from "../types";
import { ProgressBar } from "./pageHelpers";

interface GoalsPageProps {
  books: Book[];
}

const YEARLY_GOAL = 24; // no goal-setting UI yet, so these stay fixed targets for now
const MONTHLY_GOAL = 4;

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

export default function GoalsPage({ books }: GoalsPageProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthLabel = now.toLocaleString("en-US", { month: "long" });

  const completed = books.filter((b) => b.status === "completed").length;
  const monthlyRead = books.filter((b) => {
    if (!b.completedAt) return false;
    const d = new Date(b.completedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const monthlyStats = computeMonthlyCompletions(books);

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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{currentYear} Yearly Goal</p>
              <p className="text-3xl font-bold text-foreground mt-1">{completed} <span className="text-muted-foreground text-lg font-medium">/ {YEARLY_GOAL}</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
          <ProgressBar value={Math.round((completed / YEARLY_GOAL) * 100)} />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((completed / YEARLY_GOAL) * 100)}% complete · {Math.max(0, YEARLY_GOAL - completed)} books to go
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{currentMonthLabel} Goal</p>
              <p className="text-3xl font-bold text-foreground mt-1">{monthlyRead} <span className="text-muted-foreground text-lg font-medium">/ {MONTHLY_GOAL}</span></p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--chart-4) 15%, transparent)" }}
            >
              <Calendar className="w-6 h-6" style={{ color: "var(--chart-4)" }} />
            </div>
          </div>
          <ProgressBar value={Math.round((monthlyRead / MONTHLY_GOAL) * 100)} color="emerald" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((monthlyRead / MONTHLY_GOAL) * 100)}% complete · {Math.max(0, MONTHLY_GOAL - monthlyRead)} more this month
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Monthly Progress</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            <Bar dataKey="books" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Books Read" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  m.completed ? "" : "bg-muted border-2 border-border text-muted-foreground"
                }`}
                style={m.completed ? { background: "var(--chart-4)", color: "var(--primary-foreground)" } : undefined}
              >
                {m.completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{m.target}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${m.completed ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.target} books</p>
              </div>
              {m.completed && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: "color-mix(in srgb, var(--chart-4) 15%, transparent)", color: "var(--chart-4)" }}
                >
                  Achieved!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}