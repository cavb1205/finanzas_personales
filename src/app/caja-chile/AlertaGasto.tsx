"use client";

import { FiAlertTriangle } from "react-icons/fi";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";

interface Props {
  summary: MonthlySummary[];
  threshold?: number; // default: 30% above average
}

export default function AlertaGasto({ summary, threshold = 0.3 }: Props) {
  if (summary.length < 3) return null;

  // Use all but last month to compute historical average
  const historical = summary.slice(0, -1);
  const avgGastos =
    historical.reduce((s, m) => s + m.gastos, 0) / historical.length;

  const lastMonth = summary[summary.length - 1];
  const delta = lastMonth.gastos - avgGastos;
  const pct = avgGastos > 0 ? delta / avgGastos : 0;

  if (pct < threshold) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
      <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-400" size={16} />
      <p className="text-amber-200">
        <span className="font-semibold">Gasto inusual en {lastMonth.month}:</span>{" "}
        {formatCLP(lastMonth.gastos)} es un{" "}
        <span className="font-semibold text-amber-400">
          +{(pct * 100).toFixed(0)}%
        </span>{" "}
        por encima del promedio histórico ({formatCLP(Math.round(avgGastos))}).
      </p>
    </div>
  );
}
