import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import type { Book } from "./types";
import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import WishlistPage from "./pages/WishlistPage";
import GoalsPage from "./pages/GoalsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

const mockBooks: Book[] = [];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main Pages */}
      <Route path="/dashboard" element={<DashboardPage books={mockBooks} />} />
      <Route
        path="/library"
        element={
          <LibraryPage
            books={mockBooks}
            onView={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            onAdd={() => undefined}
            onToggleFavorite={() => undefined}
          />
        }
      />
      <Route
        path="/wishlist"
        element={
          <WishlistPage
            books={mockBooks}
            onMoveToLibrary={() => undefined}
            onDelete={() => undefined}
            onAdd={() => undefined}
          />
        }
      />
      <Route path="/goals" element={<GoalsPage books={mockBooks} />} />
      <Route path="/analytics" element={<AnalyticsPage books={mockBooks} />} />
      <Route path="/profile" element={<ProfilePage books={mockBooks} />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}