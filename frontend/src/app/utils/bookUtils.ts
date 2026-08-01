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
