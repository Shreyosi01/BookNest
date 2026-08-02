import {
  BookOpen, LayoutDashboard, Target, BarChart3, Sparkles,
  User, Settings, LogOut, Bookmark, Library,
} from "lucide-react";
import type { Page } from "../../types";

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

interface SidebarProps {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, isMobileOpen, onMobileClose, onLogout }: SidebarProps) {
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
              <BookOpen className="w-5 h-5 text-primary-foreground" />
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
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 22%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
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