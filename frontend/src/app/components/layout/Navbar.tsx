import { useState } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  onMobileMenuOpen: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

export function Navbar({ isDark, onToggleDark, onMobileMenuOpen, searchQuery, onSearch }: NavbarProps) {
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