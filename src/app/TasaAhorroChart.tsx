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
import { useTheme } from "next-themes";
import type { MonthlySummary } from "@/lib/sheets";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler
);

interface Props {
  summary: MonthlySummary[];
}

export default function TasaAhorroChart({ summary }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");

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
      legend: { labels: { color: ct.legendColor } },
      title: {
        display: true,
        text: "Tasa de ahorro por mes (%)",
        color: ct.titleColor,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: ct.tickColor }, grid: { color: ct.gridColor } },
      y: {
        ticks: {
          color: ct.tickColor,
          callback: (v: unknown) => `${v}%`,
        },
        grid: { color: ct.gridColor },
      },
    },
  };

  return (
    <div className={`h-64 rounded-xl border p-4 ${ct.bgPanel}`}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
