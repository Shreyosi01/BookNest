import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Camera, Check } from "lucide-react";

import Btn from "../components/common/Btn";
import type { Book, ReadingStatus } from "../types";
import { Input, ProgressBar, Select, StarRating } from "./pageHelpers";

interface AddBookPageProps {
  book?: Book;
  onSave: (data: Partial<Book>) => void;
  onCancel: () => void;
}

export default function AddBookPage({ book, onSave, onCancel }: AddBookPageProps) {
  const [form, setForm] = useState({
    title: book?.title || "",
    author: book?.author || "",
    isbn: book?.isbn || "",
    category: book?.category || "",
    genre: book?.genre || "",
    status: (book?.status || "not-started") as ReadingStatus,
    rating: book?.rating || 0,
    totalPages: String(book?.totalPages || ""),
    currentPage: String(book?.currentPage || ""),
    notes: book?.notes || "",
    quotes: book?.quotes.join("\n") || "",
    publishedYear: String(book?.publishedYear || ""),
  });

  const isEdit = !!book;
  const progress = form.totalPages && form.currentPage
    ? Math.round(Number(form.currentPage) / Number(form.totalPages) * 100) : 0;

  function f(field: string) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({
      ...form,
      rating: form.rating,
      totalPages: Number(form.totalPages) || 0,
      currentPage: Number(form.currentPage) || 0,
      progress,
      publishedYear: Number(form.publishedYear) || 0,
      quotes: form.quotes.split("\n").filter(Boolean),
      cover: book?.cover || `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format`,
    });
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {isEdit ? "Back to Book" : "Back to Library"}
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">{isEdit ? "Edit Book" : "Add New Book"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Book Information</h3>
          <div className="flex items-start gap-5">
            <div className="w-24 h-32 bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors flex-shrink-0">
              <Camera className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Cover</span>
            </div>
            <div className="flex-1 space-y-4">
              <Input label="Book Title" value={form.title} onChange={f("title")} placeholder="The Great Gatsby" required />
              <Input label="Author" value={form.author} onChange={f("author")} placeholder="F. Scott Fitzgerald" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ISBN" value={form.isbn} onChange={f("isbn")} placeholder="978-0-000-00000-0" />
            <Input label="Published Year" value={form.publishedYear} onChange={f("publishedYear")} placeholder="2024" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={f("category")} options={["Fiction", "Non-Fiction", "Technology", "Self-Help", "Psychology", "Memoir", "Design", "Philosophy", "History", "Science"]} required />
            <Input label="Genre" value={form.genre} onChange={f("genre")} placeholder="e.g. Literary Fiction" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Reading Status</h3>
          <Select label="Status" value={form.status} onChange={f("status") as any}
            options={["not-started", "reading", "paused", "completed", "wishlist"]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Pages" value={form.totalPages} onChange={f("totalPages")} placeholder="320" type="number" />
            <Input label="Current Page" value={form.currentPage} onChange={f("currentPage")} placeholder="0" type="number" />
          </div>
          {form.totalPages && form.currentPage && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your Rating</label>
            <StarRating rating={form.rating} size="md" onRate={(r) => setForm((p) => ({ ...p, rating: r }))} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Notes & Quotes</h3>
          <Input label="Personal Notes" value={form.notes} onChange={f("notes")} placeholder="Your thoughts on this book…" rows={4} />
          <Input label="Favorite Quotes" value={form.quotes} onChange={f("quotes")} placeholder="One quote per line…" rows={3} />
        </div>

        <div className="flex gap-3">
          <Btn type="submit" size="lg" className="flex-1 justify-center">
            <Check className="w-4 h-4" /> {isEdit ? "Save Changes" : "Add to Library"}
          </Btn>
          <Btn variant="outline" size="lg" onClick={onCancel}>Cancel</Btn>
        </div>
      </form>
    </div>
  );
}
