export type Page = "dashboard" | "library" | "book-detail" | "add-book" | "edit-book" | "wishlist" | "goals" | "analytics" | "profile" | "settings";
export type ReadingStatus = "reading" | "completed" | "paused" | "wishlist" | "not-started";
export type AuthMode = "signin" | "signup" | "forgot";

export interface User {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  genre: string;
  status: ReadingStatus;
  rating: number;
  progress: number;
  totalPages: number;
  currentPage: number;
  cover: string;
  notes: string;
  quotes: string[];
  favorite: boolean;
  dateAdded: string;
  publishedYear: number;
  /** Set automatically by the backend the moment status becomes "completed". */
  completedAt: string | null;
}