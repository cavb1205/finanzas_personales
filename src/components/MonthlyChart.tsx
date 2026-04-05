"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: MonthlySummary[];
  title?: string;
  currency?: "CLP" | "COP";
}

export default function MonthlyChart({ data, title = "Resumen Mensual", currency = "CLP" }: Props) {
  const fmt = currency === "COP" ? formatCOP : formatCLP;
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Ingresos",
        data: data.map((d) => d.ingresos),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Gastos",
        data: data.map((d) => d.gastos),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8" },
      },
      title: {
        display: true,
        text: title,
        color: "#e2e8f0",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            ` ${ctx.dataset.label}: ${fmt(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
      y: {
        ticks: {
          color: "#64748b",
          callback: (v: unknown) => fmt(v as number),
        },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
    },
  };

  return (
    <div className="h-80 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
}
