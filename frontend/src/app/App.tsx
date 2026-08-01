import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, Check, ArrowLeft } from "lucide-react";

import type { Page, AuthMode, Book } from "./types";

import Btn from "./components/common/Btn";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import AddBookPageView from "./pages/AddBookPage";
import BookDetailPageView from "./pages/BookDetailPage";
import WishlistPageView from "./pages/WishlistPage";
import GoalsPageView from "./pages/GoalsPage";
import AnalyticsPageView from "./pages/AnalyticsPage";
import ProfilePageView from "./pages/ProfilePage";
import SettingsPageView from "./pages/SettingsPage";
import { ConfirmModal, Input, Toast } from "./pages/pageHelpers";
import { MOCK_BOOKS } from "./data/books";
import { ROUTE_PAGES } from "./constants";
import { addBookToLibrary, deleteBookFromLibrary, moveBookToLibrary, toggleFavoriteBook, updateBookInLibrary } from "./services/bookService";
import { useBookSearch } from "./hooks/useBookSearch";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";

// ─── Auth Page ────────────────────────────────────────────────────────────────
// NOTE: components/auth/ is currently empty, so AuthPage lives here.
// If you build a dedicated AuthPage component later, move this out and
// import it the same way as the other pages above.

function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") { setSubmitted(true); return; }
    onAuth();
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=1200&fit=crop&auto=format"
          alt="Cozy library with books"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-indigo-900/70 to-black/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">BookNest</span>
          </div>
          <div>
            <blockquote className="text-2xl font-bold leading-tight mb-4">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </blockquote>
            <cite className="text-white/70 text-sm">— George R.R. Martin</cite>
            <div className="flex gap-6 mt-8">
              {[["2,400+", "Books Tracked"], ["15K+", "Readers"], ["4.9★", "Rating"]].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-white/70 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookNest</span>
          </div>

          {mode === "forgot" && submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">We've sent a reset link to <strong>{email}</strong></p>
              <Btn variant="ghost" onClick={() => { setMode("signin"); setSubmitted(false); }}>Back to Sign In</Btn>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {mode === "signin" ? "Sign in to your personal library"
                  : mode === "signup" ? "Start tracking your reading journey"
                  : "Enter your email to receive a reset link"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && <Input label="Full Name" value={name} onChange={setName} placeholder="Alex Rivera" required />}
                <Input label="Email Address" value={email} onChange={setEmail} placeholder="alex@example.com" type="email" required />
                {mode !== "forgot" && <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />}

                {mode === "signin" && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode("forgot")} className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Btn type="submit" size="lg" className="w-full justify-center mt-2">
                  {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight className="w-4 h-4" />
                </Btn>
              </form>

              {mode !== "forgot" && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "signin" ? (
                    <>Don't have an account?{" "}
                      <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Sign up</button>
                    </>
                  ) : (
                    <>Already have an account?{" "}
                      <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
                    </>
                  )}
                </div>
              )}

              {mode === "forgot" && (
                <div className="mt-4 text-center">
                  <button onClick={() => setMode("signin")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>(ROUTE_PAGES.dashboard);
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>(ROUTE_PAGES.library);
  const filteredBooks = useBookSearch(books, searchQuery);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
  }

  function navigate(page: Page) {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
  }

  function handleViewBook(book: Book) {
    setSelectedBook(book);
    setPreviousPage(currentPage);
    navigate(ROUTE_PAGES.bookDetail as Page);
  }

  function handleEditBook(book: Book) {
    setEditingBook(book);
    setSelectedBook(book);
    navigate(ROUTE_PAGES.editBook as Page);
  }

  function handleDeleteBook(book: Book) {
    setDeleteTarget(book);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setBooks((prev) => deleteBookFromLibrary(prev, deleteTarget.id));
    showToast(`"${deleteTarget.title}" removed from library`);
    setDeleteTarget(null);
    if (currentPage === ROUTE_PAGES.bookDetail) navigate(ROUTE_PAGES.library as Page);
  }

  function handleToggleFavorite(id: string) {
    setBooks((prev) => toggleFavoriteBook(prev, id));
    const book = books.find((b) => b.id === id);
    if (book) showToast(book.favorite ? "Removed from favorites" : "Added to favorites");
  }

  function handleSaveBook(data: Partial<Book>) {
    if (editingBook) {
      setBooks((prev) => updateBookInLibrary(prev, editingBook.id, data));
      showToast("Book updated successfully");
      setEditingBook(null);
      navigate(ROUTE_PAGES.library as Page);
    } else {
      setBooks((prev) => addBookToLibrary(prev, data));
      showToast("Book added to library!");
      navigate(ROUTE_PAGES.library as Page);
    }
  }

  function handleMoveToLibrary(id: string) {
    setBooks((prev) => moveBookToLibrary(prev, id));
    showToast("Book moved to library!");
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onAuth={() => setIsAuthenticated(true)} />
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage books={books} onNavigate={navigate} onView={handleViewBook} />;
      case "library":
        return (
          <LibraryPage
            books={books}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onAdd={() => { setEditingBook(null); navigate("add-book"); }}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "book-detail":
        return selectedBook ? (
          <BookDetailPageView
            book={books.find((b) => b.id === selectedBook.id) || selectedBook}
            onBack={() => navigate(previousPage)}
            onEdit={() => handleEditBook(selectedBook)}
            onDelete={() => handleDeleteBook(selectedBook)}
            onToggleFavorite={() => handleToggleFavorite(selectedBook.id)}
          />
        ) : null;
      case "add-book":
        return <AddBookPageView onSave={handleSaveBook} onCancel={() => navigate("library")} />;
      case "edit-book":
        return editingBook ? (
          <AddBookPageView
            book={editingBook}
            onSave={handleSaveBook}
            onCancel={() => navigate(selectedBook ? "book-detail" : "library")}
          />
        ) : null;
      case "wishlist":
        return (
          <WishlistPageView
            books={books}
            onMoveToLibrary={handleMoveToLibrary}
            onDelete={handleDeleteBook}
            onAdd={() => { setEditingBook(null); navigate("add-book"); }}
          />
        );
      case "goals":
        return <GoalsPageView books={books} />;
      case "analytics":
        return <AnalyticsPageView books={books} />;
      case "profile":
        return <ProfilePageView books={books} />;
      case "settings":
        return <SettingsPageView />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onLogout={() => setIsAuthenticated(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Book"
          message={`Remove "${deleteTarget.title}" from your library? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}