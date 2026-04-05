"use client";

import { useState } from "react";
import type { InvestmentEntry } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";
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
        <SelectTrigger className="w-40">
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

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">P. Compra</TableHead>
              <TableHead className="text-right">Inversión</TableHead>
              <TableHead className="text-right">P. Actual</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">G/P</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{e.etf}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {e.fechaCompra}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {e.cantidad.toFixed(5)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatUSD(e.precioCompra)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatUSD(e.inversionInicial)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
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
