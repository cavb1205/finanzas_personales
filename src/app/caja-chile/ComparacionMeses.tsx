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

function Row({
  label,
  a,
  b,
  invert,
}: {
  label: string;
  a: number;
  b: number;
  invert?: boolean; // for gastos: higher = worse
}) {
  const better = invert ? a <= b : a >= b;
  return (
    <div className="grid grid-cols-4 items-center py-2.5 border-b border-border last:border-0 gap-2">
      <span className="text-sm text-muted-foreground col-span-1">{label}</span>
      <span className={cn("font-mono text-sm font-semibold text-right", better ? "text-emerald-400" : "text-rose-400")}>
        {formatCLP(a)}
      </span>
      <span className={cn("font-mono text-sm font-semibold text-right", !better ? "text-emerald-400" : "text-rose-400")}>
        {formatCLP(b)}
      </span>
      <div className="text-right">
        <Delta current={a} previous={b} />
      </div>
    </div>
  );
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
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-4">B</span>
            <Select value={mesB} onValueChange={(v) => v && setMesB(v)}>
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dataA && dataB ? (
          <>
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-1">
              <span />
              <span className="text-xs text-muted-foreground text-right font-medium">{mesA}</span>
              <span className="text-xs text-muted-foreground text-right font-medium">{mesB}</span>
              <span className="text-xs text-muted-foreground text-right">Δ A vs B</span>
            </div>
            <Row label="Ingresos" a={dataA.ingresos} b={dataB.ingresos} />
            <Row label="Gastos"   a={dataA.gastos}   b={dataB.gastos}   invert />
            <Row label="Saldo"    a={dataA.saldo}    b={dataB.saldo}    />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona dos meses para comparar.</p>
        )}
      </CardContent>
    </Card>
  );
}
