"use client";

import { useState, useMemo } from "react";
import type { MonthlySummary } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  summary: MonthlySummary[];
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (!previous) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return (
    <span className={cn("text-xs font-mono font-semibold", up ? "text-emerald-400" : "text-rose-400")}>
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

type RowType = "ingreso" | "gasto" | "saldo";

function rowColor(type: RowType, value: number): string {
  if (type === "ingreso") return "text-emerald-400";
  if (type === "gasto") return "text-rose-400";
  // saldo: verde si >= 0, rojo si negativo
  return value >= 0 ? "text-emerald-400" : "text-rose-400";
}

function Row({
  label,
  a,
  b,
  type,
}: {
  label: string;
  a: number;
  b: number;
  type: RowType;
}) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      {/* Mobile: stacked */}
      <div className="flex items-center justify-between sm:hidden gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Delta current={a} previous={b} />
      </div>
      <div className="flex items-center justify-between sm:hidden gap-4 mt-1">
        <span className={cn("font-mono text-xs font-semibold", rowColor(type, a))}>{formatCLP(a)}</span>
        <span className={cn("font-mono text-xs font-semibold text-muted-foreground", rowColor(type, b))}>{formatCLP(b)}</span>
      </div>
      {/* Desktop: 4 columns */}
      <div className="hidden sm:grid grid-cols-4 items-center gap-2">
        <span className="text-sm text-muted-foreground col-span-1">{label}</span>
        <span className={cn("font-mono text-sm font-semibold text-right", rowColor(type, a))}>
          {formatCLP(a)}
        </span>
        <span className={cn("font-mono text-sm font-semibold text-right", rowColor(type, b))}>
          {formatCLP(b)}
        </span>
        <div className="text-right">
          <Delta current={a} previous={b} />
        </div>
      </div>
    </div>
  );
}

function formatMonthOption(month: string): string {
  // month comes as "enero 2026" from the sheet — capitalize first letter
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export default function ComparacionMeses({ summary }: Props) {
  const months = useMemo(() => summary.map((m) => m.month), [summary]);

  const [mesA, setMesA] = useState(months[months.length - 1] ?? "");
  const [mesB, setMesB] = useState(months[months.length - 2] ?? "");

  const dataA = summary.find((m) => m.month === mesA);
  const dataB = summary.find((m) => m.month === mesB);

  if (months.length < 2) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Comparación de meses</CardTitle>
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-4">A</span>
            <Select value={mesA} onValueChange={(v) => v && setMesA(v)}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonthOption(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-4">B</span>
            <Select value={mesB} onValueChange={(v) => v && setMesB(v)}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonthOption(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dataA && dataB ? (
          <>
            {/* Header — only on sm+ */}
            <div className="hidden sm:grid grid-cols-4 gap-2 mb-1">
              <span />
              <span className="text-xs text-muted-foreground text-right font-medium">{formatMonthOption(mesA)}</span>
              <span className="text-xs text-muted-foreground text-right font-medium">{formatMonthOption(mesB)}</span>
              <span className="text-xs text-muted-foreground text-right">Δ A vs B</span>
            </div>
            {/* Mobile header */}
            <div className="sm:hidden flex justify-between text-xs text-muted-foreground mb-2">
              <span>{formatMonthOption(mesA)}</span>
              <span>{formatMonthOption(mesB)}</span>
            </div>
            <Row label="Ingresos" a={dataA.ingresos} b={dataB.ingresos} type="ingreso" />
            <Row label="Gastos"   a={dataA.gastos}   b={dataB.gastos}   type="gasto" />
            <Row label="Saldo"    a={dataA.saldo}    b={dataB.saldo}    type="saldo" />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona dos meses para comparar.</p>
        )}
      </CardContent>
    </Card>
  );
}
