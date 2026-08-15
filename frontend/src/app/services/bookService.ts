import { api } from "./apiClient";
import type { Book } from "../types";

export function listBooks() {
  return api.get<Book[]>("/books");
}

export function createBook(data: Partial<Book>) {
  return api.post<Book>("/books", data);
}

export function updateBook(id: string, data: Partial<Book>) {
  return api.put<Book>(`/books/${id}`, data);
}

export function deleteBook(id: string) {
  return api.delete<void>(`/books/${id}`);
}

export function toggleFavorite(id: string, favorite: boolean) {
  return updateBook(id, { favorite });
}

export function moveToLibrary(id: string) {
  return updateBook(id, { status: "not-started" });
}