"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { InvestmentEntry } from "@/lib/sheets";
import { formatUSD } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface Props {
  entries: InvestmentEntry[];
}

const ASSET_COLORS: Record<string, { bar: string; arc: string }> = {
  GOOG: { bar: "rgba(59, 130, 246, 0.8)", arc: "rgba(59, 130, 246, 0.85)" },
  BTC:  { bar: "rgba(251, 146, 60, 0.8)", arc: "rgba(251, 146, 60, 0.85)" },
};
const DEFAULT_COLORS = [
  { bar: "rgba(129, 140, 248, 0.8)", arc: "rgba(129, 140, 248, 0.85)" },
  { bar: "rgba(52, 211, 153, 0.8)", arc: "rgba(52, 211, 153, 0.85)" },
];

export default function PortafolioCharts({ entries }: Props) {
  const byEtf = useMemo(() => {
    const map = new Map<string, { invertido: number; actual: number; ganancia: number }>();
    for (const e of entries) {
      const prev = map.get(e.etf) ?? { invertido: 0, actual: 0, ganancia: 0 };
      prev.invertido += e.inversionInicial;
      prev.actual += e.valorActual;
      prev.ganancia += e.ganancia;
      map.set(e.etf, prev);
    }
    return Array.from(map.entries());
  }, [entries]);

  const labels = byEtf.map(([etf]) => etf);

  const colors = labels.map(
    (l, i) => ASSET_COLORS[l] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]
  );

  // Bar chart: invertido vs actual
  const barData = {
    labels,
    datasets: [
      {
        label: "Invertido",
        data: byEtf.map(([, d]) => d.invertido),
        backgroundColor: colors.map((c) => c.bar.replace("0.8", "0.5")),
        borderRadius: 6,
      },
      {
        label: "Valor actual",
        data: byEtf.map(([, d]) => d.actual),
        backgroundColor: colors.map((c) => c.bar),
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
        text: "Invertido vs Valor actual por activo",
        color: "#e2e8f0",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            ` ${ctx.dataset.label ?? ""}: ${formatUSD(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(51,65,85,0.3)" } },
      y: {
        ticks: {
          color: "#64748b",
          callback: (v: unknown) => formatUSD(v as number),
        },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  // Donut: distribución por valor actual
  const donutData = {
    labels,
    datasets: [
      {
        data: byEtf.map(([, d]) => d.actual),
        backgroundColor: colors.map((c) => c.arc),
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
        labels: { color: "#94a3b8", font: { size: 13 }, padding: 16, boxWidth: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) => {
            const value = ctx.raw as number;
            const total = byEtf.reduce((s, [, d]) => s + d.actual, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return ` ${formatUSD(value)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <Tabs defaultValue="comparacion">
      <TabsList>
        <TabsTrigger value="comparacion">Invertido vs Actual</TabsTrigger>
        <TabsTrigger value="distribucion">Distribución</TabsTrigger>
      </TabsList>
      <TabsContent value="comparacion" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Bar data={barData} options={barOptions} />
        </div>
      </TabsContent>
      <TabsContent value="distribucion" className="mt-4">
        <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
