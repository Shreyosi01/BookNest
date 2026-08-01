import { Camera, Mail, MapPin, Sparkles, User } from "lucide-react";

import type { Book } from "../types";

interface ProfilePageProps {
  books: Book[];
}

export default function ProfilePage({ books }: ProfilePageProps) {
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white">
              <User className="w-10 h-10" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Maya Chen</h2>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3" /> Book Lover
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> maya@example.com</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Seattle, WA</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">I love literary fiction, psychology, and books that challenge the way I think about everyday life.</p>
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
          <p className="text-3xl font-bold text-foreground mt-1">{favorite?.category || "Fiction"}</p>
          <p className="text-sm text-muted-foreground mt-2">Your most-loved reading category</p>
        </div>
      </div>
    </div>
  );
}