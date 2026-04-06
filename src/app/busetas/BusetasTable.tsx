"use client";

import type { BusetaEntry } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
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

export default function BusetasTable({ entries }: { entries: BusetaEntry[] }) {
  const { page, totalPages, paginated, goTo } = usePagination(entries, 15);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Buseta</TableHead>
              <TableHead className="hidden sm:table-cell">Ruta</TableHead>
              <TableHead className="hidden md:table-cell text-right">Pasajeros</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Bruto</TableHead>
              <TableHead className="hidden md:table-cell text-right">ACPM</TableHead>
              <TableHead className="text-right">Gastos</TableHead>
              <TableHead className="text-right">Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {e.fecha}
                </TableCell>
                <TableCell className="text-sm">{e.buseta}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{e.ruta}</TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-sm">
                  {e.pasajeros || "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right font-mono text-xs">
                  {e.brutoTotal > 0 ? formatCOP(e.brutoTotal) : "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-xs text-rose-400">
                  {e.acpm > 0 ? formatCOP(e.acpm) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-rose-400">
                  {formatCOP(e.totalGastos)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-xs font-medium",
                    e.netoTotal >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {formatCOP(e.netoTotal)}
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
        totalItems={entries.length}
        pageSize={15}
      />
    </div>
  );
}
