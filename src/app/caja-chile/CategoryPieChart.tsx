"use client";

import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { Transaction } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "rgba(244, 63, 94, 0.8)",
  "rgba(251, 146, 60, 0.8)",
  "rgba(250, 204, 21, 0.8)",
  "rgba(163, 230, 53, 0.8)",
  "rgba(34, 211, 238, 0.8)",
  "rgba(129, 140, 248, 0.8)",
  "rgba(232, 121, 249, 0.8)",
  "rgba(251, 191, 36, 0.8)",
];

interface Props {
  transactions: Transaction[];
}

export default function CategoryPieChart({ transactions }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.gasto <= 0) continue;
      const key = t.categoria.trim() || "Sin categoría";
      map.set(key, (map.get(key) ?? 0) + t.gasto);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [transactions]);

  if (data.length === 0) return null;

  const chartData = {
    labels: data.map(([label]) => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        data: data.map(([, value]) => value),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: "rgba(15, 23, 42, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#94a3b8",
          font: { size: 12 },
          padding: 12,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) => {
            const value = ctx.raw as number;
            const total = data.reduce((s, [, v]) => s + v, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return ` ${formatCLP(value)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
