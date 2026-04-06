"use client";

import { FiTarget } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { formatCLP } from "@/lib/format";
import type { MonthlySummary } from "@/lib/sheets";

interface Props {
  summary: MonthlySummary[];
  currentMonthKey: string; // "2026-04"
}

/** Convert "2026-04" → summary month label like "Abril 2026" for matching */
function toMonthLabel(key: string): string {
  const [yyyy, mm] = key.split("-");
  const date = new Date(Number(yyyy), Number(mm) - 1, 1);
  return date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

export default function ProyeccionCard({ summary, currentMonthKey }: Props) {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Find current month in summary (may not exist yet or be partial)
  const label = toMonthLabel(currentMonthKey);
  const current = summary.find(
    (m) => m.month.toLowerCase() === label.toLowerCase()
  );

  if (!current || dayOfMonth >= daysInMonth) return null;

  // Project based on daily rate so far
  const dailyIngresos = current.ingresos / dayOfMonth;
  const dailyGastos = current.gastos / dayOfMonth;
  const projIngresos = Math.round(dailyIngresos * daysInMonth);
  const projGastos = Math.round(dailyGastos * daysInMonth);
  const projSaldo = projIngresos - projGastos;

  const daysRemaining = daysInMonth - dayOfMonth;
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FiTarget className="text-amber-400" size={16} />
            <p className="text-sm font-semibold text-amber-400">
              Proyección fin de mes
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-mono font-semibold text-foreground">{dayOfMonth}</span>
              {" "}días transcurridos
            </span>
            <span className="text-amber-400/60">·</span>
            <span>
              <span className="font-mono font-semibold text-amber-400">{daysRemaining}</span>
              {" "}restantes
            </span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{progressPct}% del mes transcurrido</span>
            <span>{dayOfMonth}/{daysInMonth}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500/60 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ingresos est.</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
              {formatCLP(projIngresos)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Gastos est.</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-rose-400">
              {formatCLP(projGastos)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Saldo est.</p>
            <p
              className={`font-mono text-xs sm:text-sm font-bold ${
                projSaldo >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCLP(projSaldo)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
