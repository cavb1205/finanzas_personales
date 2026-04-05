"use client";

import { cn } from "@/lib/utils";

interface RankItem {
  label: string;
  value: number;
  formatted: string;
}

interface Props {
  title: string;
  items: RankItem[];
  color: "rose" | "emerald";
}

export default function TopRanking({ title, items, color }: Props) {
  if (items.length === 0) return null;
  const max = items[0].value;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[60%] capitalize font-medium">
                  {item.label || "Sin descripción"}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs font-semibold",
                    color === "rose" ? "text-rose-400" : "text-emerald-400"
                  )}
                >
                  {item.formatted}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    color === "rose" ? "bg-rose-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
