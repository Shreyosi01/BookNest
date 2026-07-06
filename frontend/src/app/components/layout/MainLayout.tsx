import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import type { Page } from "../../types";

interface MainLayoutProps {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  children: ReactNode;
}

export function MainLayout({
  currentPage,
  onNavigate,
  onLogout,
  isDark,
  onToggleDark,
  searchQuery,
  onSearch,
  children,
}: MainLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          isDark={isDark}
          onToggleDark={onToggleDark}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearch={onSearch}
        />
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}