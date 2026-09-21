import { api } from "./apiClient";
import type { CatalogBook, Review } from "../types";
import type { GoogleBookResult } from "./googleBooksService";

export function upsertCatalogBook(book: GoogleBookResult) {
  return api.post<CatalogBook>("/catalog/books", {
    googleBooksId: book.googleBooksId,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    genre: book.category,
    cover: book.cover,
    publishedYear: book.publishedYear,
    totalPages: book.totalPages,
    description: book.description,
    previewLink: book.previewLink,
    buyLink: book.buyLink,
  });
}

export function getCatalogBook(id: string) {
  return api.get<CatalogBook>(`/catalog/books/${id}`);
}

export function listReviews(bookId: string) {
  return api.get<Review[]>(`/catalog/books/${bookId}/reviews`);
}

export function upsertReview(bookId: string, rating: number, text: string) {
  return api.post<Review>(`/catalog/books/${bookId}/reviews`, { rating, text });
}

export function deleteMyReview(bookId: string) {
  return api.delete<void>(`/catalog/books/${bookId}/reviews/me`);
}