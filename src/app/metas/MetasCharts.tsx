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
import { formatCOP } from "@/lib/format";

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
      legend: { labels: { color: "#94a3b8" } },
      title: {
        display: true,
        text: "Progreso de aportes acumulados",
        color: "#e2e8f0",
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
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(51,65,85,0.3)" } },
      y: {
        ticks: { color: "#64748b", callback: (v: unknown) => formatCOP(v as number) },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  return (
    <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
