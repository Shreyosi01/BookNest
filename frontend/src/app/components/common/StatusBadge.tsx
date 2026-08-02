import { ReadingStatus } from "../../types";

function statusConfig(status: ReadingStatus) {
  const map = {
    reading: {
      label: "Reading",
      color: "var(--primary)",
    },
    completed: {
      label: "Completed",
      color: "var(--chart-4)",
    },
    paused: {
      label: "Paused",
      color: "var(--accent)",
    },
    wishlist: {
      label: "Wishlist",
      color: "var(--chart-5)",
    },
    "not-started": {
      label: "Not Started",
      color: "var(--muted-foreground)",
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: `color-mix(in srgb, ${s.color} 15%, transparent)`,
        color: s.color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}