import { useEffect, useState } from "react";

import type { Page, Book, AuthMode, User, CatalogBook } from "./types";

import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DiscoverPage from "./pages/DiscoverPage";
import BookCatalogDetailPage from "./pages/BookCatalogDetailPage";
import LibraryPage from "./pages/LibraryPage";
import AddBookPageView from "./pages/AddBookPage";
import BookDetailPageView from "./pages/BookDetailPage";
import WishlistPageView from "./pages/WishlistPage";
import GoalsPageView from "./pages/GoalsPage";
import AnalyticsPageView from "./pages/AnalyticsPage";
import ProfilePageView from "./pages/ProfilePage";
import SettingsPageView from "./pages/SettingsPage";
import { ConfirmModal, Toast } from "./pages/pageHelpers";
import { ROUTE_PAGES } from "./constants";
import * as bookService from "./services/bookService";
import * as catalogService from "./services/catalogService";
import type { GoogleBookResult } from "./services/googleBooksService";
import { useBookSearch } from "./hooks/useBookSearch";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";

const EMPTY_USER: User = { id: "", name: "Reader", email: "", currentStreak: 0 };

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, isLoading: authLoading, user, authError, login, signup, logout, updateProfile } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [currentPage, setCurrentPage] = useState<Page>(ROUTE_PAGES.dashboard);
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [discoverBook, setDiscoverBook] = useState<CatalogBook | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>(ROUTE_PAGES.library);
  const filteredBooks = useBookSearch(books, searchQuery);

  // Load this user's books once they're authenticated; clear them on logout.
  useEffect(() => {
    if (!isAuthenticated) {
      setBooks([]);
      return;
    }
    setBooksLoading(true);
    bookService
      .listBooks()
      .then(setBooks)
      .catch(() => showToast("Couldn't load your library. Try refreshing.", "error"))
      .finally(() => setBooksLoading(false));
  }, [isAuthenticated]);

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      await bookService.deleteBook(target.id);
      setBooks((prev) => prev.filter((b) => b.id !== target.id));
      showToast(`"${target.title}" removed from library`);
      if (currentPage === ROUTE_PAGES.bookDetail) navigate(ROUTE_PAGES.library as Page);
    } catch {
      showToast("Couldn't delete that book. Try again.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggleFavorite(id: string) {
    const book = books.find((b) => b.id === id);
    if (!book) return;
    try {
      const updated = await bookService.toggleFavorite(id, !book.favorite);
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast(updated.favorite ? "Added to favorites" : "Removed from favorites");
    } catch {
      showToast("Couldn't update favorites. Try again.", "error");
    }
  }

  async function handleSaveBook(data: Partial<Book>) {
    try {
      if (editingBook) {
        const updated = await bookService.updateBook(editingBook.id, data);
        setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? updated : b)));
        showToast("Book updated successfully");
        setEditingBook(null);
      } else {
        const created = await bookService.createBook(data);
        setBooks((prev) => [created, ...prev]);
        showToast("Book added to library!");
      }
      navigate(ROUTE_PAGES.library as Page);
    } catch {
      showToast("Couldn't save that book. Try again.", "error");
    }
  }

  async function handleMoveToLibrary(id: string) {
    try {
      const updated = await bookService.moveToLibrary(id);
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast("Book moved to library!");
    } catch {
      showToast("Couldn't move that book. Try again.", "error");
    }
  }

  // Opens the full catalog detail page (cover, description, reviews, AI insight).
  async function handleSelectDiscoverBook(result: GoogleBookResult) {
    try {
      const catalogBook = await catalogService.upsertCatalogBook(result);
      setDiscoverBook(catalogBook);
      navigate("discover-book" as Page);
    } catch {
      showToast("Couldn't open that book right now. Try again.", "error");
    }
  }

  // Adds a book to the personal shelf from an already-open catalog record
  // (used both by the detail page's buttons and by quick-add from search results).
  async function addCatalogBookToShelf(catalogBook: CatalogBook, status: "wishlist" | "not-started") {
    const created = await bookService.createBook({
      title: catalogBook.title,
      author: catalogBook.author,
      isbn: catalogBook.isbn,
      category: catalogBook.category,
      genre: catalogBook.genre,
      cover: catalogBook.cover,
      publishedYear: catalogBook.publishedYear,
      totalPages: catalogBook.totalPages,
      status,
      catalogBookId: catalogBook.id,
    });
    setBooks((prev) => [created, ...prev]);
    showToast(status === "wishlist" ? "Added to your wishlist!" : "Added to your library!");
  }

  // "Add to Library"/"Add to Wishlist" from the full detail page — navigates away after.
  async function handleAddFromDiscover(catalogBook: CatalogBook, status: "wishlist" | "not-started") {
    try {
      await addCatalogBookToShelf(catalogBook, status);
      navigate((status === "wishlist" ? "wishlist" : "library") as Page);
    } catch {
      showToast("Couldn't add that book. Try again.", "error");
    }
  }

  // Quick-add directly from a search result card — stays on Add Books so you can keep browsing.
  async function handleQuickAddFromDiscover(result: GoogleBookResult, status: "wishlist" | "not-started") {
    try {
      const catalogBook = await catalogService.upsertCatalogBook(result);
      await addCatalogBookToShelf(catalogBook, status);
    } catch {
      showToast("Couldn't add that book. Try again.", "error");
    }
  }

  function handleManualAdd() {
    setEditingBook(null);
    navigate("add-book");
  }

  function handleLogout() {
    logout();
    setShowAuth(false); // send them back to the landing page, not straight to the auth form
  }

  function openSignup() {
    setAuthMode("signup");
    setShowAuth(true);
  }

  function openSignin() {
    setAuthMode("signin");
    setShowAuth(true);
  }

  // Brief gate while we check localStorage for an existing session, so we don't
  // flash the landing page for a logged-in user on refresh.
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        {showAuth ? (
          <AuthPage
            initialMode={authMode}
            onBack={() => setShowAuth(false)}
            isDark={isDark}
            onToggleDark={() => setIsDark(!isDark)}
            onLogin={login}
            onSignup={signup}
            authError={authError}
          />
        ) : (
          <LandingPage
            onGetStarted={openSignup}
            onSignIn={openSignin}
            isDark={isDark}
            onToggleDark={() => setIsDark(!isDark)}
          />
        )}
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  const currentUser = user ?? EMPTY_USER;

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            books={books}
            onNavigate={navigate}
            onView={handleViewBook}
            userName={currentUser.name}
            streak={currentUser.currentStreak}
          />
        );
      case "discover":
        return (
          <DiscoverPage
            onSelectBook={handleSelectDiscoverBook}
            onQuickAdd={handleQuickAddFromDiscover}
            onManualAdd={handleManualAdd}
          />
        );
      case "discover-book":
        return discoverBook ? (
          <BookCatalogDetailPage
            book={discoverBook}
            onBack={() => navigate("discover" as Page)}
            onAddToLibrary={handleAddFromDiscover}
          />
        ) : null;
      case "library":
        return (
          <LibraryPage
            books={books}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            onAdd={() => navigate("discover" as Page)}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "book-detail":
        return selectedBook ? (
          <BookDetailPageView
            book={books.find((b) => b.id === selectedBook.id) || selectedBook}
            currentUserId={currentUser.id}
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
            onAdd={() => navigate("discover" as Page)}
          />
        );
      case "goals":
        return <GoalsPageView books={books} />;
      case "analytics":
        return <AnalyticsPageView books={books} />;
      case "profile":
        return (
          <ProfilePageView
            books={books}
            user={currentUser}
            onUpdateProfile={updateProfile}
            onLogout={handleLogout}
          />
        );
      case "settings":
        return <SettingsPageView isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />;
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
          userName={currentUser.name}
          streak={currentUser.currentStreak}
          books={books}
          onProfileClick={() => navigate("profile")}
        />
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {booksLoading ? (
            <div className="text-sm text-muted-foreground">Loading your library…</div>
          ) : (
            renderPage()
          )}
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