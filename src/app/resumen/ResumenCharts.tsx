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
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

interface Props {
  chileSum: MonthlySummary[];
}

export default function ResumenCharts({ chileSum }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");

  if (chileSum.length === 0) return null;

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
      legend: { labels: { color: ct.legendColor } },
      title: {
        display: true,
        text: "Tasa de ahorro mensual",
        color: ct.titleColor,
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
      x: { ticks: { color: ct.tickColor }, grid: { color: ct.gridColor } },
      y: {
        ticks: { color: ct.tickColor, callback: (v: unknown) => `${v}%` },
        grid: { color: ct.gridColor },
      },
    },
  };

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
      legend: { labels: { color: ct.legendColor } },
      title: {
        display: true,
        text: "Flujo mensual Caja Chile",
        color: ct.titleColor,
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
      x: { ticks: { color: ct.tickColor }, grid: { color: ct.gridColor } },
      y: {
        ticks: {
          color: ct.tickColor,
          callback: (v: unknown) => formatCLP(v as number),
        },
        grid: { color: ct.gridColor },
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
        <div className={`h-72 rounded-xl border p-4 ${ct.bgPanel}`}>
          <Line data={tasaData} options={tasaOptions} />
        </div>
      </TabsContent>
      <TabsContent value="flujo" className="mt-4">
        <div className={`h-72 rounded-xl border p-4 ${ct.bgPanel}`}>
          <Bar data={flujoData} options={flujoOptions} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
