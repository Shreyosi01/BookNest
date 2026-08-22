import { useState } from "react";
import { Mail, Sparkles, User as UserIcon, Camera, Pencil, Check, X, LogOut } from "lucide-react";

import type { Book, User } from "../types";
import { ConfirmModal } from "./pageHelpers";

interface ProfilePageProps {
  books: Book[];
  user: User;
  onUpdateProfile: (name: string) => Promise<boolean>;
  onLogout: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage({ books, user, onUpdateProfile, onLogout }: ProfilePageProps) {
  const completed = books.filter((b) => b.status === "completed").length;
  const favorite = books.find((b) => b.favorite);

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleSave() {
    if (!nameDraft.trim()) return;
    setSaving(true);
    const ok = await onUpdateProfile(nameDraft.trim());
    setSaving(false);
    if (ok) setIsEditing(false);
  }

  function handleCancel() {
    setNameDraft(user.name);
    setIsEditing(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your reading identity and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit profile
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[var(--chart-5)] flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {user.name ? getInitials(user.name) : <UserIcon className="w-10 h-10" />}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !nameDraft.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Sparkles className="w-3 h-3" /> Book Lover
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Books Completed</p>
          <p className="text-3xl font-bold text-foreground mt-1">{completed}</p>
          <p className="text-sm text-muted-foreground mt-2">A steady journey through your library</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Favorite Genre</p>
          <p className="text-3xl font-bold text-foreground mt-1">{favorite?.category || "—"}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {favorite ? "Your most-loved reading category" : "Mark a book as favorite to see it here"}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Sign out</h3>
          <p className="text-sm text-muted-foreground">End your session on this device</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out"
          message="Are you sure you want to log out of BookNest?"
          confirmLabel="Log out"
          variant="primary"
          onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}