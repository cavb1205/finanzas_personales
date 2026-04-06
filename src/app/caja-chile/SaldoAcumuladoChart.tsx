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
import { useTheme } from "next-themes";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
  summary: MonthlySummary[];
  currency?: "CLP" | "COP";
}

export default function SaldoAcumuladoChart({ summary, currency = "CLP" }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");
  const fmt = currency === "COP" ? formatCOP : formatCLP;

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
      legend: { labels: { color: ct.legendColor } },
      title: {
        display: true,
        text: "Saldo acumulado",
        color: ct.titleColor,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${fmt(ctx.raw as number)}`,
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
    <div className={`h-64 rounded-xl border p-4 ${ct.bgPanel}`}>
      <Line data={chartData} options={options} />
    </div>
  );
}
