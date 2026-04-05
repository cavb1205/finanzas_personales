import { FiTruck, FiUsers, FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getControlBusetas, getDashboardBusetas } from "@/lib/sheets";
import { formatCOP, formatNumber, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import BusetasTable from "./BusetasTable";
import BusetasCharts from "./BusetasCharts";
import EmptyState from "@/components/EmptyState";

export const revalidate = 300;

export default async function BusetasPage() {
  const [entries, dashboard] = await Promise.all([
    getControlBusetas(),
    getDashboardBusetas(),
  ]);

  const totalBruto = entries.reduce((s, e) => s + e.brutoTotal, 0);
  const totalGastos = entries.reduce((s, e) => s + e.totalGastos, 0);
  const totalNeto = entries.reduce((s, e) => s + e.netoTotal, 0);
  const totalPasajeros = entries.reduce((s, e) => s + e.pasajeros, 0);
  const totalViajes = entries.filter((e) => e.brutoTotal > 0).length;

  // Margen operativo
  const margen = totalBruto > 0 ? (totalNeto / totalBruto) * 100 : 0;

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control Busetas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Operación diaria del negocio de transporte
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ingreso Bruto"
          value={formatCOP(totalBruto)}
          subtitle={`${totalViajes} viajes registrados`}
          icon={<FiDollarSign size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCOP(totalGastos)}
          subtitle={`${margen >= 0 ? "Margen " + margen.toFixed(1) + "%" : "Margen negativo"}`}
          icon={<FiTrendingDown size={20} />}
          color="rose"
        />
        <DashboardCard
          title="Neto"
          value={formatCOP(totalNeto)}
          subtitle={
            dashboard.crecimiento !== 0
              ? `${formatPercent(dashboard.crecimiento)} vs mes anterior`
              : undefined
          }
          icon={<FiTrendingUp size={20} />}
          color={totalNeto >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Pasajeros"
          value={formatNumber(totalPasajeros)}
          subtitle={`~${totalViajes > 0 ? formatNumber(Math.round(totalPasajeros / totalViajes)) : 0} por viaje`}
          icon={<FiUsers size={20} />}
          color="indigo"
        />
      </div>

      {/* Mes anterior vs actual */}
      {(dashboard.gananciaAnterior > 0 || dashboard.gananciaActual > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ganancia mes anterior</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {formatCOP(dashboard.gananciaAnterior)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ganancia mes actual</p>
            <p className={cn("text-2xl font-bold font-mono", dashboard.crecimiento >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {formatCOP(dashboard.gananciaActual)}
            </p>
            {dashboard.crecimiento !== 0 && (
              <p className={cn("text-xs font-mono", dashboard.crecimiento >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {formatPercent(dashboard.crecimiento)} vs mes anterior
              </p>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="graficos">
        <TabsList>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="viajes">Detalle Viajes</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="mt-6">
          <BusetasCharts monthly={dashboard.monthly} gastos={dashboard.gastos} />
        </TabsContent>

        <TabsContent value="viajes" className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Detalle de Viajes</h2>
          <BusetasTable entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
