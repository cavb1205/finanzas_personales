"use client";

import { useState, useMemo } from "react";
import type { BusetaEntry } from "@/lib/sheets";
import { formatCOP, formatNumber, formatPercent } from "@/lib/format";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BusetasTable from "./BusetasTable";

function toMonthKey(fecha: string): string {
  const sep = fecha.includes("/") ? "/" : "-";
  const parts = fecha.split(sep);
  if (parts.length === 3) {
    // DD/MM/YYYY
    const [, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}`;
  }
  return "";
}

function monthLabel(key: string): string {
  const [yyyy, mm] = key.split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

interface Props {
  entries: BusetaEntry[];
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "rose" | "blue" | "amber";
}) {
  const colorMap = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-4 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-bold font-mono", color ? colorMap[color] : "text-foreground")}>
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function BusetasMes({ entries }: Props) {
  // Build sorted month list
  const months = useMemo(() => {
    const keys = new Set<string>();
    for (const e of entries) {
      const k = toMonthKey(e.fecha);
      if (k) keys.add(k);
    }
    return Array.from(keys).sort().reverse();
  }, [entries]);

  // Default to current month, fallback to most recent
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const defaultMonth = months.includes(currentMonthKey) ? currentMonthKey : (months[0] ?? "");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedBuseta, setSelectedBuseta] = useState("all");

  const byMonth = useMemo(
    () => entries.filter((e) => toMonthKey(e.fecha) === selectedMonth),
    [entries, selectedMonth]
  );

  // Busetas available for the selected month
  const busetas = useMemo(() => {
    const names = new Set<string>();
    for (const e of byMonth) if (e.buseta) names.add(e.buseta);
    return Array.from(names).sort();
  }, [byMonth]);

  const filtered = useMemo(
    () => selectedBuseta === "all" ? byMonth : byMonth.filter((e) => e.buseta === selectedBuseta),
    [byMonth, selectedBuseta]
  );

  const bruto = filtered.reduce((s, e) => s + e.brutoTotal, 0);
  const gastos = filtered.reduce((s, e) => s + e.totalGastos, 0);
  const neto = filtered.reduce((s, e) => s + e.netoTotal, 0);
  const pasajeros = filtered.reduce((s, e) => s + e.pasajeros, 0);
  const viajes = filtered.filter((e) => e.brutoTotal > 0).length;
  const margen = bruto > 0 ? (neto / bruto) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedMonth} onValueChange={(v) => { if (v) { setSelectedMonth(v); setSelectedBuseta("all"); } }}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {busetas.length > 1 && (
          <Select value={selectedBuseta} onValueChange={(v) => { if (v) setSelectedBuseta(v); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todas las busetas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las busetas</SelectItem>
              {busetas.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* KPI cards for selected month */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin registros para este mes.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Ingreso Bruto"
              value={formatCOP(bruto)}
              sub={`${viajes} viaje${viajes !== 1 ? "s" : ""} registrados`}
              color="blue"
            />
            <KpiCard
              label="Total Gastos"
              value={formatCOP(gastos)}
              sub={`Margen ${margen.toFixed(1)}%`}
              color="rose"
            />
            <KpiCard
              label="Neto"
              value={formatCOP(neto)}
              color={neto >= 0 ? "emerald" : "rose"}
            />
            <KpiCard
              label="Pasajeros"
              value={formatNumber(pasajeros)}
              sub={viajes > 0 ? `~${formatNumber(Math.round(pasajeros / viajes))} por viaje` : undefined}
              color="amber"
            />
          </div>

          {/* Desglose de gastos del mes */}
          {filtered.some((e) => e.acpm + e.basico + e.varios + e.montajeLlanta + e.otros > 0) && (
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { label: "ACPM", value: filtered.reduce((s, e) => s + e.acpm, 0) },
                { label: "Básico", value: filtered.reduce((s, e) => s + e.basico, 0) },
                { label: "Varios", value: filtered.reduce((s, e) => s + e.varios, 0) },
                { label: "Montaje Llanta", value: filtered.reduce((s, e) => s + e.montajeLlanta, 0) },
                { label: "Otros", value: filtered.reduce((s, e) => s + e.otros, 0) },
              ].filter((g) => g.value > 0).map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-mono text-sm font-semibold text-rose-400">{formatCOP(value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {gastos > 0 ? ((value / gastos) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Detail table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Detalle de viajes — {monthLabel(selectedMonth)}
            </h3>
            <BusetasTable entries={filtered} />
          </div>
        </>
      )}
    </div>
  );
}
