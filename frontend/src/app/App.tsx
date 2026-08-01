import { useEffect, useState } from "react";

import type { Page, Book } from "./types";

import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import AddBookPageView from "./pages/AddBookPage";
import BookDetailPageView from "./pages/BookDetailPage";
import WishlistPageView from "./pages/WishlistPage";
import GoalsPageView from "./pages/GoalsPage";
import AnalyticsPageView from "./pages/AnalyticsPage";
import ProfilePageView from "./pages/ProfilePage";
import SettingsPageView from "./pages/SettingsPage";
import { ConfirmModal, Toast } from "./pages/pageHelpers";
import { MOCK_BOOKS } from "./data/books";
import { ROUTE_PAGES } from "./constants";
import { addBookToLibrary, deleteBookFromLibrary, moveBookToLibrary, toggleFavoriteBook, updateBookInLibrary } from "./services/bookService";
import { useBookSearch } from "./hooks/useBookSearch";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
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

  function handleLogout() {
    setIsAuthenticated(false);
    setShowAuth(false); // send them back to the landing page, not straight to the auth form
  }

  if (!isAuthenticated) {
    return (
      <>
        {showAuth ? (
          <AuthPage onAuth={() => setIsAuthenticated(true)} onBack={() => setShowAuth(false)} />
        ) : (
          <LandingPage onGetStarted={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />
        )}
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
        onLogout={handleLogout}
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