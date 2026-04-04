import { type ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color?: "emerald" | "blue" | "amber" | "rose" | "indigo" | "purple";
}

const colorMap = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = "emerald",
}: Props) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
