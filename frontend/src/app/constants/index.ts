import {
  BarChart3,
  Bookmark,
  LayoutDashboard,
  Library,
  Search,
  Settings,
  Sparkles,
  Target,
  User,
} from "lucide-react";

export const BOOK_STATUSES = ["not-started", "reading", "paused", "completed", "wishlist"] as const;

export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Technology",
  "Self-Help",
  "Psychology",
  "Memoir",
  "Design",
  "Philosophy",
  "History",
  "Science",
] as const;

export const ROUTE_PAGES = {
  dashboard: "dashboard",
  library: "library",
  discover: "discover",
  bookDetail: "book-detail",
  addBook: "add-book",
  editBook: "edit-book",
  wishlist: "wishlist",
  goals: "goals",
  analytics: "analytics",
  profile: "profile",
  settings: "settings",
} as const;

export const NAV_ITEMS = [
  { id: ROUTE_PAGES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { id: ROUTE_PAGES.library, label: "My Library", icon: Library },
  { id: ROUTE_PAGES.discover, label: "Discover Books", icon: Search },
  { id: ROUTE_PAGES.wishlist, label: "Wishlist", icon: Bookmark },
  { id: ROUTE_PAGES.goals, label: "Reading Goals", icon: Target },
  { id: ROUTE_PAGES.analytics, label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Recommendations", icon: Sparkles, comingSoon: true },
];

export const NAV_BOTTOM = [
  { id: ROUTE_PAGES.profile, label: "Profile", icon: User },
  { id: ROUTE_PAGES.settings, label: "Settings", icon: Settings },
];
