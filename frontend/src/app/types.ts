export type Page =
  | "dashboard"
  | "discover"
  | "discover-book"
  | "library"
  | "book-detail"
  | "add-book"
  | "edit-book"
  | "wishlist"
  | "goals"
  | "analytics"
  | "profile"
  | "settings";
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
  completedAt?: string | null;
  /** Links back to the shared public catalog record, when this book was added via Add Books / Discover. */
  catalogBookId?: string | null;
}

/** A shared, public catalog record — one per real book, regardless of how many
 * users have it on their personal shelf. This is what reviews attach to. */
export interface CatalogBook {
  id: string;
  googleBooksId: string | null;
  title: string;
  author: string;
  isbn: string;
  category: string;
  genre: string;
  cover: string;
  publishedYear: number;
  totalPages: number;
  description: string;
  previewLink: string;
  buyLink: string;
  averageRating: number;
  reviewCount: number;
}

/** A public review, visible to every user. */
export interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  reviewerName: string;
  reviewerId: string;
}