import { useState } from "react";
import { ChevronDown, Check, AlertCircle, X } from "lucide-react";

import Btn from "../components/common/Btn";

export function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Fiction: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400",
    "Non-Fiction": "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
    Technology: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
    "Self-Help": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    Psychology: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
    Memoir: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    Design: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
    Philosophy: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    History: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    Science: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  };
  return map[cat] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor(category)}`}>
      {category}
    </span>
  );
}

export function StarRating({ rating, onRate, size = "sm" }: { rating: number; onRate?: (r: number) => void; size?: "sm" | "md" }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onRate?.(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className={`${onRate ? "cursor-pointer" : "cursor-default"} transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={`${sz} ${(hovered || rating) >= n ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          >
            <path d="M12 2.75l2.7 5.47 6.05.88-4.38 4.27 1.03 6.03L12 16.77l-5.4 2.68 1.03-6.03-4.38-4.27 6.05-.88L12 2.75Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, color = "primary" }: { value: number; color?: "primary" | "emerald" | "amber" }) {
  const colorMap = { primary: "bg-primary", emerald: "bg-emerald-500", amber: "bg-amber-500" };
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Input({
  label, value, onChange, placeholder, type = "text", required = false, rows,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; rows?: number;
}) {
  const cls = "w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      {rows ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows} required={required}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} required={required} className={cls}
        />
      )}
    </div>
  );
}

export function Select({
  label, value, onChange, options, required = false,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  options:  readonly string[]; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)} required={required}
          className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none pr-10"
        >
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

export function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300"}`}>
      {type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onCancel} className="flex-1">Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm} className="flex-1">Delete</Btn>
        </div>
      </div>
    </div>
  );
}
