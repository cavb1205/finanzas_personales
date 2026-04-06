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
import { useTheme } from "next-themes";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: MonthlySummary[];
  title?: string;
  currency?: "CLP" | "COP";
}

export default function MonthlyChart({ data, title = "Resumen Mensual", currency = "CLP" }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");
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
      legend: { labels: { color: ct.legendColor } },
      title: {
        display: true,
        text: title,
        color: ct.titleColor,
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
        ticks: { color: ct.tickColor },
        grid: { color: ct.gridColor },
      },
      y: {
        ticks: {
          color: ct.tickColor,
          callback: (v: unknown) => fmt(v as number),
        },
        grid: { color: ct.gridColor },
      },
    },
  };

  return (
    <div className={`h-80 rounded-xl border p-4 ${ct.bgPanel}`}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
