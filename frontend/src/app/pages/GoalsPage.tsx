import { Award, Calendar, Check } from "lucide-react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Book } from "../types";
import { ProgressBar } from "./pageHelpers";

interface GoalsPageProps {
  books: Book[];
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

export default function GoalsPage({ books }: GoalsPageProps) {
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
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--chart-4) 15%, transparent)" }}
            >
              <Calendar className="w-6 h-6" style={{ color: "var(--chart-4)" }} />
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
                  style={{
                    background: "color-mix(in srgb, var(--chart-4) 15%, transparent)",
                    color: "var(--chart-4)",
                  }}
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