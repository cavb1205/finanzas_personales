"use client";

import MonthlyChart from "@/components/MonthlyChart";
import type { MonthlySummary } from "@/lib/sheets";

export default function CajaChileCharts({ summary }: { summary: MonthlySummary[] }) {
  return <MonthlyChart data={summary} title="Ingresos vs Gastos por Mes" />;
}
