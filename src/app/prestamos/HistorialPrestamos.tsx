"use client";

import { useState, useMemo } from "react";
import type { Prestamo, PrestamoResumen } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface Props {
  movimientos: Prestamo[];
  resumen: PrestamoResumen[];
}

export default function HistorialPrestamos({ movimientos, resumen }: Props) {
  const personas = useMemo(
    () => ["all", ...resumen.map((r) => r.persona).filter(Boolean)],
    [resumen]
  );
  const [persona, setPersona] = useState("all");

  const filtrados = useMemo(
    () => persona === "all" ? movimientos : movimientos.filter((m) => m.persona === persona),
    [movimientos, persona]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Historial completo</h2>
        <Select value={persona} onValueChange={(v) => { if (v) setPersona(v); }}>
          <SelectTrigger className="w-full sm:w-44 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las personas</SelectItem>
            {personas.slice(1).map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtrados.length} movimiento{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Operación</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="hidden lg:table-cell">Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-0">
                  <EmptyState title="Sin movimientos" description="No hay movimientos para esta persona." />
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((m, i) => {
                const esPrestamo =
                  m.operacion.includes("PRÉSTAMO") || m.operacion.includes("PRESTAMO");
                return (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {m.fecha}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{m.persona}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs whitespace-nowrap",
                          esPrestamo
                            ? "border-rose-500/30 text-rose-400"
                            : "border-emerald-500/30 text-emerald-400"
                        )}
                      >
                        {m.operacion}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono text-xs font-semibold whitespace-nowrap",
                      esPrestamo ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {esPrestamo ? "-" : "+"}{formatCOP(m.monto)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{m.observaciones}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
