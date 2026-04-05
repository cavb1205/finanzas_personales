"use client";

import { useState, useMemo } from "react";
import type { Prestamo, PrestamoResumen } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FiArrowDownCircle, FiArrowUpCircle } from "react-icons/fi";
import EmptyState from "@/components/EmptyState";

interface Props {
  movimientos: Prestamo[];
  resumen: PrestamoResumen[];
}

export default function PrestamosDetalle({ movimientos, resumen }: Props) {
  const personas = useMemo(
    () => resumen.map((r) => r.persona).filter(Boolean),
    [resumen]
  );
  const [persona, setPersona] = useState(personas[0] ?? "");

  const filtrados = useMemo(
    () => movimientos.filter((m) => m.persona === persona),
    [movimientos, persona]
  );

  const resumenPersona = resumen.find((r) => r.persona === persona);

  if (personas.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Detalle por persona</h2>
        <Select value={persona} onValueChange={(v) => v && setPersona(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {personas.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {resumenPersona && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Deuda total</p>
            <p className="font-mono text-lg font-bold mt-1">{formatCOP(resumenPersona.deudaTotal)}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-muted-foreground">Pagado</p>
            <p className="font-mono text-lg font-bold text-emerald-400 mt-1">
              {formatCOP(resumenPersona.totalPagado)}
            </p>
          </div>
          <div className={cn(
            "rounded-lg border p-4",
            resumenPersona.saldoPendiente === 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          )}>
            <p className="text-xs text-muted-foreground">Pendiente</p>
            <p className={cn(
              "font-mono text-lg font-bold mt-1",
              resumenPersona.saldoPendiente === 0 ? "text-emerald-400" : "text-amber-400"
            )}>
              {formatCOP(resumenPersona.saldoPendiente)}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {filtrados.length === 0 ? (
        <EmptyState title="Sin movimientos" description={`No hay movimientos registrados para ${persona}.`} />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Timeline de movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {/* vertical line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

              {filtrados.map((m, i) => {
                const esPrestamo =
                  m.operacion.toLowerCase().includes("préstamo") ||
                  m.operacion.toLowerCase().includes("prestamo");
                return (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* dot */}
                    <div className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                      esPrestamo
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                        : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    )}>
                      {esPrestamo
                        ? <FiArrowDownCircle size={14} />
                        : <FiArrowUpCircle size={14} />
                      }
                    </div>

                    {/* content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                esPrestamo
                                  ? "border-rose-500/30 text-rose-400"
                                  : "border-emerald-500/30 text-emerald-400"
                              )}
                            >
                              {m.operacion}
                            </Badge>
                          </div>
                          {m.observaciones && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {m.observaciones}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "font-mono text-sm font-semibold",
                            esPrestamo ? "text-rose-400" : "text-emerald-400"
                          )}>
                            {esPrestamo ? "-" : "+"}{formatCOP(m.monto)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.fecha}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
