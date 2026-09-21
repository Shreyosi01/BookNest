import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Edit2, Heart, Trash2, Tag, Quote, FileText, Sparkles, Loader2 } from "lucide-react";

import Btn from "../components/common/Btn";
import StatusBadge from "../components/common/StatusBadge";
import type { Book, Review } from "../types";
import { CategoryBadge, ConfirmModal, ProgressBar, StarRating } from "./pageHelpers";
import * as catalogService from "../services/catalogService";

interface BookDetailPageProps {
  book: Book;
  currentUserId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function BookDetailPage({ book, currentUserId, onBack, onEdit, onDelete, onToggleFavorite }: BookDetailPageProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canReview = book.status === "completed" && !!book.catalogBookId;

  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!canReview || !book.catalogBookId) return;
    setLoadingReview(true);
    catalogService
      .listReviews(book.catalogBookId)
      .then((reviews) => {
        setMyReview(reviews.find((r) => r.reviewerId === currentUserId) || null);
      })
      .catch(() => setReviewError("Couldn't check for an existing review."))
      .finally(() => setLoadingReview(false));
  }, [book.catalogBookId, canReview, currentUserId]);

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (!book.catalogBookId) return;
    if (myRating === 0) {
      setReviewError("Pick a star rating first.");
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const saved = await catalogService.upsertReview(book.catalogBookId, myRating, myText.trim());
      setMyReview(saved);
    } catch {
      setReviewError("Couldn't post your review. Try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-muted aspect-[2/3] shadow-lg">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={book.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <CategoryBadge category={book.category} />
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Rating</span>
              <StarRating rating={book.rating} size="md" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-foreground">{book.publishedYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ISBN</span>
              <span className="text-xs font-mono text-muted-foreground">{book.isbn}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={onEdit} className="flex-1 justify-center" size="sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Btn>
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${book.favorite ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30 dark:border-rose-800" : "border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"}`}
            >
              <Heart className={`w-4 h-4 ${book.favorite ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{book.author}</p>
            <div className="flex items-center gap-2 mt-3">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{book.genre}</span>
            </div>
          </div>

          {book.status === "reading" && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Reading Progress</h3>
                <span className="text-sm font-bold text-primary">{book.progress}%</span>
              </div>
              <ProgressBar value={book.progress} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Page {book.currentPage} of {book.totalPages}</span>
                <span>{book.totalPages - book.currentPage} pages remaining</span>
              </div>
            </div>
          )}

          {canReview && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Write a public review
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                You finished this one — share what you thought. Visible to everyone on BookNest.
              </p>
              {loadingReview ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : myReview ? (
                <div>
                  <StarRating rating={myReview.rating} />
                  {myReview.text && <p className="text-sm text-muted-foreground mt-2">{myReview.text}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Your review is live — everyone can see it.</p>
                </div>
              ) : (
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
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
                  >
                    {submittingReview ? "Posting…" : "Post public review"}
                  </button>
                </form>
              )}
            </div>
          )}

          {book.notes && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Personal Notes</h3>
                <span className="text-xs text-muted-foreground ml-auto">Only visible to you</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{book.notes}</p>
            </div>
          )}

          {book.quotes.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Favorite Quotes</h3>
              </div>
              <div className="space-y-3">
                {book.quotes.map((q, i) => (
                  <blockquote key={i} className="pl-4 border-l-2 border-primary/30 text-sm text-muted-foreground italic">
                    "{q}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {!book.notes && book.quotes.length === 0 && !canReview && (
            <div className="bg-muted/50 border border-border rounded-2xl p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notes or quotes yet.</p>
              <Btn variant="ghost" size="sm" onClick={onEdit} className="mt-2">Add notes</Btn>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Book"
          message={`Are you sure you want to remove "${book.title}" from your library? This action cannot be undone.`}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}