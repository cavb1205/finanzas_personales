"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { BusetaDashboard, BusetaGastosDetalle } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler
);

interface Props {
  monthly: BusetaDashboard[];
  gastos: BusetaGastosDetalle[];
}

export default function BusetasCharts({ monthly, gastos }: Props) {
  if (monthly.length === 0) return null;

  // Bruto vs Neto por mes
  const barData = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: "Bruto",
        data: monthly.map((m) => m.bruto),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Gastos",
        data: monthly.map((m) => m.gastos),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Neto",
        data: monthly.map((m) => m.neto),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      title: {
        display: true,
        text: "Bruto / Gastos / Neto por mes",
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

  // Donut de desglose de gastos (suma total de todos los meses)
  const gastosAgg = gastos.reduce(
    (acc, g) => {
      acc.acpm += g.acpm;
      acc.basico += g.basico;
      acc.varios += g.varios;
      acc.montajeLlanta += g.montajeLlanta;
      acc.otros += g.otros;
      return acc;
    },
    { acpm: 0, basico: 0, varios: 0, montajeLlanta: 0, otros: 0 }
  );

  const donutLabels = ["ACPM", "Básico", "Varios", "Montaje Llanta", "Otros"];
  const donutValues = [
    gastosAgg.acpm,
    gastosAgg.basico,
    gastosAgg.varios,
    gastosAgg.montajeLlanta,
    gastosAgg.otros,
  ];
  const donutColors = [
    "rgba(244, 63, 94, 0.85)",
    "rgba(251, 146, 60, 0.85)",
    "rgba(250, 204, 21, 0.85)",
    "rgba(129, 140, 248, 0.85)",
    "rgba(100, 116, 139, 0.85)",
  ];

  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: donutColors,
        borderColor: "rgba(15, 23, 42, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: { color: "#94a3b8", font: { size: 12 }, padding: 14, boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) => {
            const value = ctx.raw as number;
            const total = donutValues.reduce((s, v) => s + v, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return ` ${formatCOP(value)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <Tabs defaultValue="mensual">
      <TabsList>
        <TabsTrigger value="mensual">Mensual</TabsTrigger>
        <TabsTrigger value="gastos">Desglose gastos</TabsTrigger>
      </TabsList>
      <TabsContent value="mensual" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Bar data={barData} options={barOptions} />
        </div>
      </TabsContent>
      <TabsContent value="gastos" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
