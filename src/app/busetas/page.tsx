import { FiTruck, FiTrendingUp, FiTrendingDown, FiBarChart2, FiCalendar } from "react-icons/fi";
import { getControlBusetas, getDashboardBusetas } from "@/lib/sheets";
import { formatCOP, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import BusetasCharts from "./BusetasCharts";
import BusetasMes from "./BusetasMes";
import EmptyState from "@/components/EmptyState";

export const revalidate = 300;

export default async function BusetasPage() {
  const [entries, dashboard] = await Promise.all([
    getControlBusetas(),
    getDashboardBusetas(),
  ]);

  if (entries.length === 0 && dashboard.monthly.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control Busetas</h1>
          <p className="text-muted-foreground text-sm mt-1">Operación diaria del negocio de transporte</p>
        </div>
        <Separator />
        <EmptyState
          title="Sin datos de busetas"
          description="No hay registros de viajes disponibles en este momento."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <FiTruck size={18} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control Busetas</h1>
          <p className="text-muted-foreground text-sm">Operación diaria del negocio de transporte</p>
        </div>
      </div>

      <Separator />

      {/* Resumen general */}
      {(dashboard.gananciaActual > 0 || dashboard.gananciaAnterior > 0 || dashboard.monthly.length > 0) && (() => {
        const brutoAnual = dashboard.monthly.reduce((s, m) => s + m.bruto, 0);
        const netoAnual = dashboard.monthly.reduce((s, m) => s + m.neto, 0);
        const gastosAnual = dashboard.monthly.reduce((s, m) => s + m.gastos, 0);
        const margenAnual = brutoAnual > 0 ? (netoAnual / brutoAnual) * 100 : 0;
        const mejorMes = dashboard.monthly.length > 0
          ? dashboard.monthly.reduce((best, m) => m.neto > best.neto ? m : best)
          : null;
        const crecUp = dashboard.crecimiento >= 0;

        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Resumen general</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Mes anterior vs actual */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FiCalendar size={13} />
                  Ganancia mes anterior
                </div>
                <p className="text-xl font-bold font-mono">{formatCOP(dashboard.gananciaAnterior)}</p>
              </div>
              <div className={cn(
                "rounded-xl border p-4 space-y-3",
                crecUp ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"
              )}>
                <div className={cn("flex items-center gap-2 text-xs", crecUp ? "text-emerald-400" : "text-rose-400")}>
                  {crecUp ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
                  Ganancia mes actual
                </div>
                <p className={cn("text-xl font-bold font-mono", crecUp ? "text-emerald-400" : "text-rose-400")}>
                  {formatCOP(dashboard.gananciaActual)}
                </p>
                {dashboard.crecimiento !== 0 && (
                  <p className={cn("text-xs font-mono", crecUp ? "text-emerald-400" : "text-rose-400")}>
                    {crecUp ? "+" : ""}{formatPercent(dashboard.crecimiento)} vs anterior
                  </p>
                )}
              </div>

              {/* Acumulado año */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FiBarChart2 size={13} />
                  Neto acumulado {new Date().getFullYear()}
                </div>
                <p className={cn("text-xl font-bold font-mono", netoAnual >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {formatCOP(netoAnual)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margen {margenAnual.toFixed(1)}% · Bruto {formatCOP(brutoAnual)}
                </p>
              </div>

              {/* Mejor mes */}
              {mejorMes && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FiTrendingUp size={13} />
                    Mejor mes
                  </div>
                  <p className="text-xl font-bold font-mono text-emerald-400">{formatCOP(mejorMes.neto)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mejorMes.month}</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <Separator />

      <Tabs defaultValue="mes">
        <TabsList>
          <TabsTrigger value="mes">Por mes</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="mes" className="mt-6">
          <BusetasMes entries={entries} />
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <BusetasCharts monthly={dashboard.monthly} gastos={dashboard.gastos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
