import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  /** A CSS color value for the icon chip background, e.g. "var(--chart-1)" or "var(--primary)". */
  color: string;
  /** Icon color on top of the chip. Defaults to a light color; pass a dark value for light chip backgrounds (e.g. gold/accent). */
  iconColor?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  iconColor = "var(--primary-foreground)",
}: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>

          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>

          {sub && (
            <p className="text-xs text-muted-foreground mt-1">
              {sub}
            </p>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}