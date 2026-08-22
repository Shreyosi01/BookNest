import { useState } from "react";
import { Bell, BellOff, Moon, Sun, ShieldCheck, ShieldOff, Sparkles } from "lucide-react";

interface SettingsPageProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export default function SettingsPage({ isDark, onToggleDark }: SettingsPageProps) {
  // These two aren't backed by the server yet — they reset on refresh. Worth
  // a small backend field if you want them to persist across sessions.
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [privacyProtected, setPrivacyProtected] = useState(true);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Customize your reading experience</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Dark Mode</h3>
            <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
          </div>
          <button
            onClick={onToggleDark}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">{isDark ? "Dark" : "Light"}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <p className="text-sm text-muted-foreground">Get reminders for reading goals and milestones</p>
          </div>
          <button
            onClick={() => setNotificationsOn((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors"
          >
            {notificationsOn ? <Bell className="w-4 h-4 text-muted-foreground" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">{notificationsOn ? "On" : "Off"}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Privacy</h3>
            <p className="text-sm text-muted-foreground">Keep your library data private and secure</p>
          </div>
          <button
            onClick={() => setPrivacyProtected((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors"
          >
            {privacyProtected ? <ShieldCheck className="w-4 h-4 text-muted-foreground" /> : <ShieldOff className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">{privacyProtected ? "Protected" : "Public"}</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-[var(--chart-5)]/10 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Pro Tip</h3>
        </div>
        <p className="text-sm text-muted-foreground">Set monthly reading goals and keep your wishlist updated to build momentum over time.</p>
      </div>
    </div>
  );
}