"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  summary: MonthlySummary[];
}

export default function SaldoAcumuladoChart({ summary }: Props) {
  if (summary.length === 0) return null;

  let acum = 0;
  const acumulados = summary.map((m) => {
    acum += m.saldo;
    return acum;
  });

  const isPositive = acumulados[acumulados.length - 1] >= 0;

  const chartData = {
    labels: summary.map((d) => d.month),
    datasets: [
      {
        label: "Saldo acumulado",
        data: acumulados,
        borderColor: isPositive ? "rgba(16, 185, 129, 1)" : "rgba(244, 63, 94, 1)",
        backgroundColor: isPositive
          ? "rgba(16, 185, 129, 0.08)"
          : "rgba(244, 63, 94, 0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: isPositive
          ? "rgba(16, 185, 129, 1)"
          : "rgba(244, 63, 94, 1)",
        tension: 0.3,
        fill: true,
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
        text: "Saldo acumulado",
        color: "#e2e8f0",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${formatCLP(ctx.raw as number)}`,
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
          callback: (v: unknown) => formatCLP(v as number),
        },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
    },
  };

  return (
    <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
