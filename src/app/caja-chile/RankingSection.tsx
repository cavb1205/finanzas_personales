"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import TopRanking from "@/components/TopRanking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function parseMonthKey(fecha: string): string {
  // "d/MM/yyyy" → "yyyy-MM"
  const parts = fecha.split("/");
  if (parts.length !== 3) return "";
  const [, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  // "2026-04" → "Abril 2026"
  const [yyyy, mm] = key.split("-");
  const date = new Date(Number(yyyy), Number(mm) - 1, 1);
  return date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

function buildRanking(transactions: Transaction[], type: "gasto" | "ingreso") {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const value = type === "gasto" ? t.gasto : t.ingreso;
    if (value <= 0) continue;
    const key = t.descripcion.trim().toLowerCase() || "sin descripción";
    map.set(key, (map.get(key) ?? 0) + value);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value, formatted: formatCLP(value) }));
}

export default function RankingSection({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Build sorted list of unique months
  const months = useMemo(() => {
    const keys = new Set<string>();
    for (const t of transactions) {
      const k = parseMonthKey(t.fecha);
      if (k) keys.add(k);
    }
    return Array.from(keys).sort().reverse(); // newest first
  }, [transactions]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Default to current month if it exists, otherwise the most recent
  const defaultMonth = months.includes(currentMonth) ? currentMonth : (months[0] ?? "");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const filtered = useMemo(
    () => transactions.filter((t) => parseMonthKey(t.fecha) === selectedMonth),
    [transactions, selectedMonth]
  );

  const topGastos = useMemo(() => buildRanking(filtered, "gasto"), [filtered]);
  const topIngresos = useMemo(() => buildRanking(filtered, "ingreso"), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Distribución por mes</h2>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopRanking title="" items={topGastos} color="rose" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopRanking title="" items={topIngresos} color="emerald" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
