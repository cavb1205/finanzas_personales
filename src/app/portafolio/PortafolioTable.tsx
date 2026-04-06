"use client";

import { useState } from "react";
import type { InvestmentEntry } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";

function diasDesde(fechaStr: string): number | null {
  const sep = fechaStr.includes("/") ? "/" : "-";
  const parts = fechaStr.split(sep);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function tenenciaLabel(dias: number): string {
  if (dias < 30) return `${dias}d`;
  if (dias < 365) return `${Math.floor(dias / 30)}m`;
  const y = Math.floor(dias / 365);
  const m = Math.floor((dias % 365) / 30);
  return m > 0 ? `${y}a ${m}m` : `${y}a`;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/EmptyState";

export default function PortafolioTable({
  entries,
}: {
  entries: InvestmentEntry[];
}) {
  if (entries.length === 0) {
    return <EmptyState title="Sin posiciones" description="No hay entradas de portafolio registradas." />;
  }

  const [filterEtf, setFilterEtf] = useState<string>("all");
  const handleEtfChange = (value: string | null) =>
    setFilterEtf(value ?? "all");

  const etfs = Array.from(new Set(entries.map((e) => e.etf)));
  const filtered =
    filterEtf === "all" ? entries : entries.filter((e) => e.etf === filterEtf);

  const { page, totalPages, paginated, goTo } = usePagination(filtered, 20);

  return (
    <div className="space-y-4">
      <Select
        value={filterEtf}
        onValueChange={(v) => {
          handleEtfChange(v);
          goTo(1);
        }}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {etfs.map((etf) => (
            <SelectItem key={etf} value={etf}>
              {etf}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead className="hidden sm:table-cell">Compra</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Tenencia</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="hidden md:table-cell text-right">P. Compra</TableHead>
              <TableHead className="text-right">Inversión</TableHead>
              <TableHead className="hidden md:table-cell text-right">P. Actual</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">G/P</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{e.etf}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <p className="font-mono text-xs font-semibold">{e.fechaCompra}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right">
                  {(() => {
                    const dias = diasDesde(e.fechaCompra);
                    return dias !== null ? (
                      <span className="font-mono text-xs text-muted-foreground">{tenenciaLabel(dias)}</span>
                    ) : <span className="text-muted-foreground">—</span>;
                  })()}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {e.cantidad.toFixed(5)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-xs">
                  {formatUSD(e.precioCompra)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatUSD(e.inversionInicial)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-xs">
                  {formatUSD(e.precioActual)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-medium">
                  {formatUSD(e.valorActual)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-xs font-medium",
                    e.ganancia >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {formatPercent(e.gananciaPercent)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPage={goTo}
        totalItems={filtered.length}
        pageSize={20}
      />
    </div>
  );
}
