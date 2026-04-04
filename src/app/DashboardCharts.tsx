"use client";

import MonthlyChart from "@/components/MonthlyChart";
import type { MonthlySummary } from "@/lib/sheets";

interface Props {
  summary: MonthlySummary[];
}

export default function DashboardCharts({ summary }: Props) {
  return <MonthlyChart data={summary} title="Caja Chile - Resumen Mensual" />;
}
