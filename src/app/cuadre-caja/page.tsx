import { FiDollarSign, FiCreditCard, FiMonitor, FiTrendingUp } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getCuadreCaja } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CuadreCajaCharts from "./CuadreCajaCharts";
import EmptyState from "@/components/EmptyState";

export const revalidate = 300;

export default async function CuadreCajaPage() {
  const {
    terminales,
    cuentas,
    totalTerminales,
    totalCuentas,
    saldoFavor,
    monthly2025,
    monthly2026,
  } = await getCuadreCaja();

  const totalCuentasSaldo = cuentas.reduce((s, c) => s + c.saldo, 0);
  const totalDeudas = cuentas.reduce((s, c) => s + c.deuda, 0);

  if (terminales.length === 0 && cuentas.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuadre de Caja</h1>
          <p className="text-muted-foreground text-sm mt-1">Balance operativo de terminales y cuentas</p>
        </div>
        <Separator />
        <EmptyState title="Sin datos de cuadre" description="No hay datos de cuadre de caja disponibles." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cuadre de Caja</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Balance operativo de terminales y cuentas bancarias
        </p>
      </div>

      <Separator />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Terminales"
          value={formatCOP(totalTerminales)}
          tooltip="Suma del efectivo en caja de todos los terminales"
          icon={<FiMonitor size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Caja + Cuentas"
          value={formatCOP(totalCuentas)}
          tooltip="Suma de efectivo en terminales más saldos en cuentas bancarias"
          icon={<FiDollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Saldo Favor / Contra"
          value={formatCOP(saldoFavor)}
          tooltip="Diferencia entre lo registrado en sistema y el efectivo real en caja"
          icon={<FiTrendingUp size={20} />}
          color={saldoFavor >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Total Deudas"
          value={formatCOP(totalDeudas)}
          tooltip="Suma de deudas en tarjetas y créditos bancarios"
          icon={<FiCreditCard size={20} />}
          color="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Terminales */}
        {terminales.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FiMonitor size={15} className="text-blue-400" />
                Terminales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {terminales.map((t) => {
                const diff = t.caja - t.sistema;
                return (
                  <div key={t.nombre} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.nombre}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-mono",
                          diff === 0
                            ? "border-emerald-500/30 text-emerald-400"
                            : diff > 0
                            ? "border-blue-500/30 text-blue-400"
                            : "border-rose-500/30 text-rose-400"
                        )}
                      >
                        {diff > 0 ? "+" : ""}{formatCOP(diff)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Sistema</span>
                        <span className="font-mono">{formatCOP(t.sistema)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Caja</span>
                        <span className="font-mono">{formatCOP(t.caja)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Cuentas bancarias */}
        {cuentas.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FiCreditCard size={15} className="text-indigo-400" />
                Cuentas Bancarias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cuentas.map((c) => (
                <div key={c.nombre} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{c.nombre}</span>
                  <div className="text-right space-y-0.5">
                    {c.saldo > 0 && (
                      <p className="font-mono text-xs text-emerald-400">
                        {formatCOP(c.saldo)}
                      </p>
                    )}
                    {c.deuda > 0 && (
                      <p className="font-mono text-xs text-rose-400">
                        -{formatCOP(c.deuda)}
                      </p>
                    )}
                    {c.saldo === 0 && c.deuda === 0 && (
                      <p className="font-mono text-xs text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-sm font-semibold">
                <span>Neto cuentas</span>
                <span className={cn("font-mono", (totalCuentasSaldo - totalDeudas) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {formatCOP(totalCuentasSaldo - totalDeudas)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Histórico mensual */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Histórico mensual</h2>
        <CuadreCajaCharts monthly2025={monthly2025} monthly2026={monthly2026} />
      </div>
    </div>
  );
}
