"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiInfo } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Linea {
  label: string;
  valor: string;
  positivo?: boolean;
}

interface Props {
  activos: Linea[];
  pasivos: Linea[];
  tasaAhorro: number | null; // porcentaje, puede ser null si no hay datos
  mesLabel: string;
}

export default function PatrimonioNeto({
  activos,
  pasivos,
  tasaAhorro,
  mesLabel,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Activos */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activos.map((a) => (
            <div key={a.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{a.label}</span>
              <span className="font-mono font-semibold text-emerald-400">{a.valor}</span>
            </div>
          ))}
          <div className="mt-1 h-px bg-emerald-500/20" />
          <p className="text-xs text-muted-foreground text-right">
            {activos.length} fuentes de activos
          </p>
        </CardContent>
      </Card>

      {/* Pasivos */}
      <Card className="border-rose-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Pasivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pasivos.map((p) => (
            <div key={p.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{p.label}</span>
              <span className="font-mono font-semibold text-rose-400">{p.valor}</span>
            </div>
          ))}
          <div className="mt-1 h-px bg-rose-500/20" />
          <p className="text-xs text-muted-foreground text-right">
            {pasivos.length} obligaciones activas
          </p>
        </CardContent>
      </Card>

      {/* Tasa de ahorro */}
      <Card className="border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            Tasa de Ahorro
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground/50 hover:text-muted-foreground cursor-default">
                  <FiInfo size={12} />
                </TooltipTrigger>
                <TooltipContent>
                  (Ingresos − Gastos) / Ingresos × 100. Meta recomendada: ≥20%.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-4rem)] gap-2">
          {tasaAhorro !== null ? (
            <>
              <p
                className={cn(
                  "text-5xl font-bold font-mono tracking-tight",
                  tasaAhorro >= 20
                    ? "text-emerald-400"
                    : tasaAhorro >= 0
                    ? "text-amber-400"
                    : "text-rose-400"
                )}
              >
                {tasaAhorro.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground text-center">
                del ingreso ahorrado en {mesLabel}
              </p>
              <div className="w-full mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    tasaAhorro >= 20
                      ? "bg-emerald-500"
                      : tasaAhorro >= 0
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  )}
                  style={{ width: `${Math.min(Math.max(tasaAhorro, 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tasaAhorro >= 20
                  ? "Excelente — meta recomendada superada"
                  : tasaAhorro >= 10
                  ? "Bien — apunta al 20% como meta"
                  : tasaAhorro >= 0
                  ? "Bajo — intenta reducir gastos variables"
                  : "Gasto mayor al ingreso este mes"}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Sin datos del mes actual</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
