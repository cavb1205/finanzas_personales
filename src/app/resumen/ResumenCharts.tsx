"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  chileSum: MonthlySummary[];
}

export default function ResumenCharts({ chileSum }: Props) {
  if (chileSum.length === 0) return null;

  // Tasa de ahorro mensual
  const tasas = chileSum.map((m) =>
    m.ingresos > 0 ? parseFloat(((m.saldo / m.ingresos) * 100).toFixed(1)) : 0
  );

  const tasaData = {
    labels: chileSum.map((d) => d.month),
    datasets: [
      {
        label: "Tasa de ahorro (%)",
        data: tasas,
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: tasas.map((t) =>
          t >= 20
            ? "rgba(16, 185, 129, 1)"
            : t >= 0
            ? "rgba(251, 191, 36, 1)"
            : "rgba(244, 63, 94, 1)"
        ),
        tension: 0.3,
        fill: true,
      },
      {
        label: "Meta (20%)",
        data: chileSum.map(() => 20),
        borderColor: "rgba(16, 185, 129, 0.4)",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const tasaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      title: {
        display: true,
        text: "Tasa de ahorro mensual",
        color: "#e2e8f0",
        font: { size: 15 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            ` ${ctx.dataset.label}: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(51,65,85,0.3)" } },
      y: {
        ticks: { color: "#64748b", callback: (v: unknown) => `${v}%` },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  // Ingresos vs Gastos Chile
  const flujoData = {
    labels: chileSum.map((d) => d.month),
    datasets: [
      {
        label: "Ingresos",
        data: chileSum.map((d) => d.ingresos),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Gastos",
        data: chileSum.map((d) => d.gastos),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Saldo",
        data: chileSum.map((d) => d.saldo),
        backgroundColor: "rgba(139, 92, 246, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const flujoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      title: {
        display: true,
        text: "Flujo mensual Caja Chile",
        color: "#e2e8f0",
        font: { size: 15 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            ` ${ctx.dataset.label}: ${formatCLP(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(51,65,85,0.3)" } },
      y: {
        ticks: {
          color: "#64748b",
          callback: (v: unknown) => formatCLP(v as number),
        },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  return (
    <Tabs defaultValue="ahorro">
      <TabsList>
        <TabsTrigger value="ahorro">Tasa de ahorro</TabsTrigger>
        <TabsTrigger value="flujo">Flujo mensual</TabsTrigger>
      </TabsList>
      <TabsContent value="ahorro" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Line data={tasaData} options={tasaOptions} />
        </div>
      </TabsContent>
      <TabsContent value="flujo" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Bar data={flujoData} options={flujoOptions} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
