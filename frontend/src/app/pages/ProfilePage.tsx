import { Mail, Sparkles, User as UserIcon, Camera } from "lucide-react";

import type { Book, User } from "../types";

interface ProfilePageProps {
  books: Book[];
  user: User;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage({ books, user }: ProfilePageProps) {
  const completed = books.filter((b) => b.status === "completed").length;
  const favorite = books.find((b) => b.favorite);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your reading identity and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[var(--chart-5)] flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {user.name ? getInitials(user.name) : <UserIcon className="w-10 h-10" />}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3" /> Book Lover
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</div>
            </div>
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
    </div>
  );
}