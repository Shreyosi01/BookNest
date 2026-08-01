import type { Book, ReadingStatus } from "../types";

export function addBookToLibrary(books: Book[], data: Partial<Book>): Book[] {
  const newBook: Book = {
    id: Date.now().toString(),
    title: "",
    author: "",
    isbn: "",
    category: "",
    genre: "",
    status: "not-started",
    rating: 0,
    progress: 0,
    totalPages: 0,
    currentPage: 0,
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format",
    notes: "",
    quotes: [],
    favorite: false,
    dateAdded: new Date().toISOString().split("T")[0],
    publishedYear: new Date().getFullYear(),
    ...data,
  };

  return [newBook, ...books];
}

export function updateBookInLibrary(books: Book[], id: string, data: Partial<Book>): Book[] {
  return books.map((book) => (book.id === id ? { ...book, ...data } : book));
}

export function deleteBookFromLibrary(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function toggleFavoriteBook(books: Book[], id: string): Book[] {
  return books.map((book) => (book.id === id ? { ...book, favorite: !book.favorite } : book));
}

export function moveBookToLibrary(books: Book[], id: string): Book[] {
  return books.map((book) => (book.id === id ? { ...book, status: "not-started" as ReadingStatus } : book));
}
