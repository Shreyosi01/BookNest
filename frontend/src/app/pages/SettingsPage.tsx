import { Bell, Moon, ShieldCheck, Sparkles } from "lucide-react";

export default function SettingsPage() {
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Auto</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <p className="text-sm text-muted-foreground">Get reminders for reading goals and milestones</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">On</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Privacy</h3>
            <p className="text-sm text-muted-foreground">Keep your library data private and secure</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Protected</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Pro Tip</h3>
        </div>
        <p className="text-sm text-muted-foreground">Set monthly reading goals and keep your wishlist updated to build momentum over time.</p>
      </div>
    </div>
  );
}