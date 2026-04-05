"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthlySummary } from "@/lib/sheets";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  summary: MonthlySummary[];
}

export default function TasaAhorroChart({ summary }: Props) {
  if (summary.length === 0) return null;

  const tasas = summary.map((m) =>
    m.ingresos > 0 ? parseFloat(((m.saldo / m.ingresos) * 100).toFixed(1)) : 0
  );

  const chartData = {
    labels: summary.map((d) => d.month),
    datasets: [
      {
        label: "Tasa de ahorro (%)",
        data: tasas,
        backgroundColor: tasas.map((t) =>
          t >= 20
            ? "rgba(16, 185, 129, 0.75)"
            : t >= 0
            ? "rgba(251, 191, 36, 0.75)"
            : "rgba(244, 63, 94, 0.75)"
        ),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      title: {
        display: true,
        text: "Tasa de ahorro por mes (%)",
        color: "#e2e8f0",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(51,65,85,0.3)" } },
      y: {
        ticks: {
          color: "#64748b",
          callback: (v: unknown) => `${v}%`,
        },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  return (
    <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
}
