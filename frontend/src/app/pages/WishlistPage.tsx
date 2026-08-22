import { Bookmark, BookOpen, Plus, Trash2 } from "lucide-react";

import Btn from "../components/common/Btn";
import type { Book } from "../types";
import { CategoryBadge } from "./pageHelpers";

interface WishlistPageProps {
  books: Book[];
  onMoveToLibrary: (id: string) => void;
  onDelete: (book: Book) => void;
  onAdd: () => void;
}

export default function WishlistPage({ books, onMoveToLibrary, onDelete, onAdd }: WishlistPageProps) {
  const wishlist = books.filter((b) => b.status === "wishlist");
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{wishlist.length} books to read</p>
        </div>
        <Btn onClick={onAdd}><Plus className="w-4 h-4" /> Add to Wishlist</Btn>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "color-mix(in srgb, var(--chart-5) 15%, transparent)" }}
          >
            <Bookmark className="w-8 h-8" style={{ color: "var(--chart-5)" }} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">Add books you want to read next</p>
          <Btn onClick={onAdd}><Plus className="w-4 h-4" /> Add First Book</Btn>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((book) => (
            <div key={book.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="flex gap-4 p-4">
                <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                  <CategoryBadge category={book.category} />
                  <p className="text-xs text-muted-foreground mt-2">{book.totalPages} pages · {book.publishedYear}</p>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <Btn variant="primary" size="sm" onClick={() => onMoveToLibrary(book.id)} className="flex-1 justify-center">
                  <BookOpen className="w-3.5 h-3.5" /> Start Reading
                </Btn>
                <button
                  onClick={() => onDelete(book)}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}