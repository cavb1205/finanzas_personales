"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { formatCOP } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MonthlyTotal {
  month: string;
  total: number;
}

interface Props {
  monthly2025: MonthlyTotal[];
  monthly2026: MonthlyTotal[];
}

function makeBarData(data: MonthlyTotal[], color: string) {
  return {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Total caja",
        data: data.map((d) => d.total),
        backgroundColor: color,
        borderRadius: 6,
      },
    ],
  };
}

export default function CuadreCajaCharts({ monthly2025, monthly2026 }: Props) {
  const { resolvedTheme } = useTheme();
  const ct = getChartTheme(resolvedTheme !== "light");

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: ct.legendColor } },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${formatCOP(ctx.raw as number)}`,
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

  const has2025 = monthly2025.some((m) => m.total > 0);
  const has2026 = monthly2026.some((m) => m.total > 0);

  if (!has2025 && !has2026) return null;

  return (
    <Tabs defaultValue={has2026 ? "2026" : "2025"}>
      <TabsList>
        {has2026 && <TabsTrigger value="2026">2026</TabsTrigger>}
        {has2025 && <TabsTrigger value="2025">2025</TabsTrigger>}
      </TabsList>
      {has2026 && (
        <TabsContent value="2026" className="mt-4">
          <div className={`h-64 rounded-xl border p-4 ${ct.bgPanel}`}>
            <Bar
              data={makeBarData(monthly2026, "rgba(16, 185, 129, 0.7)")}
              options={{ ...barOptions, plugins: { ...barOptions.plugins, title: { display: true, text: "Cuadre de caja mensual 2026", color: ct.titleColor, font: { size: 16 } } } }}
            />
          </div>
        </TabsContent>
      )}
      {has2025 && (
        <TabsContent value="2025" className="mt-4">
          <div className={`h-64 rounded-xl border p-4 ${ct.bgPanel}`}>
            <Bar
              data={makeBarData(monthly2025, "rgba(59, 130, 246, 0.7)")}
              options={{ ...barOptions, plugins: { ...barOptions.plugins, title: { display: true, text: "Cuadre de caja mensual 2025", color: ct.titleColor, font: { size: 16 } } } }}
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
