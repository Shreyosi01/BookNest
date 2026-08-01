import { ReadingStatus } from "../../types";

function statusConfig(status: ReadingStatus) {
  const map = {
    reading: {
      label: "Reading",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    paused: {
      label: "Paused",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    wishlist: {
      label: "Wishlist",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-700 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    "not-started": {
      label: "Not Started",
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      dot: "bg-slate-500",
    },
  };

  return map[status];
}

interface StatusBadgeProps {
  status: ReadingStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}