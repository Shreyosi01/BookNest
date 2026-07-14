import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import WishlistPage from "./pages/WishlistPage";
import GoalsPage from "./pages/GoalsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main Pages */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}