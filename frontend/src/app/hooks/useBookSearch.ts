import { useMemo } from "react";
import type { Book } from "../types";

export function useBookSearch(books: Book[], searchQuery: string) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) => {
      const haystack = `${book.title} ${book.author} ${book.category} ${book.genre}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [books, searchQuery]);
}
