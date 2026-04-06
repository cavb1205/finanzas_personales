"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { formatCOP } from "@/lib/format";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface Aporte {
  mes: string;
  valor: number;
  acumulado: number;
}

interface Props {
  aportes: Aporte[];
  meta: number;
}

export default function MetasCharts({ aportes, meta }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");

  if (aportes.length === 0) return null;

  const labels = aportes.map((a) => a.mes);
  const acumulados = aportes.map((a) => a.acumulado);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Acumulado",
        data: acumulados,
        borderColor: "rgba(168, 85, 247, 1)",
        backgroundColor: "rgba(168, 85, 247, 0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "rgba(168, 85, 247, 1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Meta",
        data: Array(labels.length).fill(meta),
        borderColor: "rgba(251, 191, 36, 0.6)",
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
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
        text: "Progreso de aportes acumulados",
        color: ct.titleColor,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            ` ${ctx.dataset.label ?? ""}: ${formatCOP(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: ct.tickColor }, grid: { color: ct.gridColor } },
      y: {
        ticks: { color: ct.tickColor, callback: (v: unknown) => formatCOP(v as number) },
        grid: { color: ct.gridColor },
      },
    },
  };

  return (
    <div className={`h-72 rounded-xl border p-4 ${ct.bgPanel}`}>
      <Line data={chartData} options={options} />
    </div>
  );
}
