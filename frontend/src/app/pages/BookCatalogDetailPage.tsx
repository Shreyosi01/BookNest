import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Star, BookOpen, Bookmark, Loader2, ExternalLink, ShoppingCart } from "lucide-react";

import type { CatalogBook, Review } from "../types";
import * as catalogService from "../services/catalogService";
import { StarRating } from "./pageHelpers";

interface BookCatalogDetailPageProps {
  book: CatalogBook;
  onBack: () => void;
  onAddToLibrary: (book: CatalogBook, status: "wishlist" | "not-started") => void;
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function BookCatalogDetailPage({ book, onBack, onAddToLibrary }: BookCatalogDetailPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    setLoadingReviews(true);
    catalogService
      .listReviews(book.id)
      .then(setReviews)
      .catch(() => setReviewError("Couldn't load reviews right now."))
      .finally(() => setLoadingReviews(false));
  }, [book.id]);

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (myRating === 0) {
      setReviewError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setReviewError(null);
    try {
      const saved = await catalogService.upsertReview(book.id, myRating, myText.trim());
      setReviews((prev) => [saved, ...prev.filter((r) => r.reviewerId !== saved.reviewerId)]);
      setMyRating(0);
      setMyText("");
    } catch {
      setReviewError("Couldn't post your review. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLongDescription = book.description.length > 320;
  const descriptionToShow = showFullDescription || !isLongDescription
    ? book.description
    : `${book.description.slice(0, 320)}…`;

  return (
    <div className="max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-muted aspect-[2/3] shadow-lg">
            {book.cover ? (
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
                {book.title}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4" style={{ fill: "var(--accent)", color: "var(--accent)" }} />
                <span className="font-medium text-foreground">
                  {book.reviewCount > 0 ? book.averageRating.toFixed(1) : "No ratings yet"}
                </span>
                {book.reviewCount > 0 && <span className="text-muted-foreground text-xs">({book.reviewCount})</span>}
              </div>
            </div>
            {book.publishedYear > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium text-foreground">{book.publishedYear}</span>
              </div>
            )}
            {book.totalPages > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-medium text-foreground">{book.totalPages}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onAddToLibrary(book, "not-started")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" /> Add to Library
            </button>
            <button
              onClick={() => onAddToLibrary(book, "wishlist")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Bookmark className="w-4 h-4" /> Add to Wishlist
            </button>

            {(book.previewLink || book.buyLink) && (
              <div className="flex gap-2 pt-1">
                {book.previewLink && (
                  <a
                    href={book.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Read preview
                  </a>
                )}
                {book.buyLink && (
                  <a
                    href={book.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Buy
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{book.author || "Unknown author"}</p>
            {book.category && <p className="text-sm text-muted-foreground mt-2">{book.category}</p>}
          </div>

          {book.description && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{descriptionToShow}</p>
              {isLongDescription && (
                <button
                  onClick={() => setShowFullDescription((v) => !v)}
                  className="text-xs font-medium text-primary hover:underline mt-2"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Write a review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <StarRating rating={myRating} onRate={setMyRating} size="md" />
              <textarea
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                placeholder="What did you think of this book?"
                rows={3}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {submitting ? "Posting…" : "Post review"}
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h3>
            {loadingReviews ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reviews yet — be the first to share what you thought.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {getInitials(r.reviewerName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{r.reviewerName}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(r.createdAt)}</span>
                      </div>
                      <StarRating rating={r.rating} />
                      {r.text && <p className="text-sm text-muted-foreground mt-1.5">{r.text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}