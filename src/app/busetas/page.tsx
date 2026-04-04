import { FiTruck, FiUsers, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getControlBusetas, getDashboardBusetas } from "@/lib/sheets";
import { formatCOP, formatNumber, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BusetasTable from "./BusetasTable";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control Busetas</h1>
        <p className="text-muted-foreground text-sm mt-1">Operación diaria del negocio de transporte</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ingreso Bruto"
          value={formatCOP(totalBruto)}
          subtitle={`${totalViajes} viajes`}
          icon={<FiDollarSign size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCOP(totalGastos)}
          icon={<FiTruck size={20} />}
          color="rose"
        />
        <DashboardCard
          title="Neto"
          value={formatCOP(totalNeto)}
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

      {/* Monthly dashboard */}
      {dashboard.monthly.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {dashboard.monthly.map((m) => (
            <Card key={m.month}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{m.month}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bruto</span>
                  <span className="font-mono text-xs">{formatCOP(m.bruto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="font-mono text-xs text-rose-400">{formatCOP(m.gastos)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Neto</span>
                  <span className={cn("font-mono text-sm", m.neto >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {formatCOP(m.neto)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dashboard.monthly.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Mes anterior: <span className="font-mono text-foreground">{formatCOP(dashboard.gananciaAnterior)}</span></span>
          <span>Mes actual: <span className="font-mono text-foreground">{formatCOP(dashboard.gananciaActual)}</span></span>
          <span>Crecimiento: <span className={cn("font-mono", dashboard.crecimiento >= 0 ? "text-emerald-400" : "text-rose-400")}>{formatPercent(dashboard.crecimiento)}</span></span>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Detalle de Viajes</h2>
        <BusetasTable entries={entries} />
      </div>
    </div>
  );
}
