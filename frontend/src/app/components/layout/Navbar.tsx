import { useState } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import type { Book } from "../../types";

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  onMobileMenuOpen: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  userName?: string;
  streak?: number;
  books?: Book[];
  onProfileClick?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildNotifications(streak: number = 0, books: Book[] = []) {
  const items: { msg: string; time: string; color: string }[] = [];

  if (streak > 0) {
    items.push({
      msg: `Reading streak: ${streak} day${streak === 1 ? "" : "s"}! Keep it up.`,
      time: "today",
      color: "var(--chart-1)",
    });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const addedThisWeek = (books || []).filter((b) => new Date(b.dateAdded) >= oneWeekAgo).length;
  if (addedThisWeek > 0) {
    items.push({
      msg: `You've added ${addedThisWeek} book${addedThisWeek === 1 ? "" : "s"} this week.`,
      time: "this week",
      color: "var(--chart-4)",
    });
  }

  const now = new Date();
  const monthlyGoal = 4;
  const monthlyRead = (books || []).filter((b) => {
    if (!b.completedAt) return false;
    const d = new Date(b.completedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  if (monthlyRead > 0) {
    items.push({
      msg: `Monthly goal: ${Math.min(100, Math.round((monthlyRead / monthlyGoal) * 100))}% complete.`,
      time: "this month",
      color: "var(--primary)",
    });
  }

  return items.slice(0, 3);
}

export function Navbar({
  isDark,
  onToggleDark,
  onMobileMenuOpen,
  searchQuery,
  onSearch,
  userName = "Reader",
  streak = 0,
  books = [],
  onProfileClick = () => {},
}: NavbarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifications = buildNotifications(streak, books);

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
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-xs text-muted-foreground text-center">
                  No notifications yet — add a book to get started.
                </p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                    <div>
                      <p className="text-xs text-foreground">{n.msg}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggleDark}
          className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onProfileClick}
          className="flex items-center gap-2.5 pl-2 border-l border-border ml-1 hover:opacity-75 transition-opacity"
        >
          <p className="text-xs font-medium text-foreground hidden sm:block">{userName}</p>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {getInitials(userName)}
          </div>
        </button>
      </div>
    </header>
  );
}