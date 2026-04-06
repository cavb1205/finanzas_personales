import { FiDollarSign, FiCreditCard, FiActivity, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getCuadreCaja } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const totalCajaEfectivo = terminales.reduce((s, t) => s + t.caja, 0);
  const totalCajaMasCuentas = totalCajaEfectivo + totalCuentasSaldo;

  // Calculate saldo from our own numbers, not from sheet
  const saldoCalculado = totalCajaMasCuentas - totalTerminales;
  const cuadrado = saldoCalculado === 0;
  const favor = saldoCalculado > 0;

  if (terminales.length === 0 && cuentas.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuadre de Caja</h1>
          <p className="text-muted-foreground text-sm mt-1">Balance operativo de rutas y cuentas bancarias</p>
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
          Control del efectivo por ruta vs lo registrado en sistema
        </p>
      </div>

      <Separator />

      {/* Balance general */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Sistema (rutas)"
          value={formatCLP(totalTerminales)}
          tooltip="Suma de lo que debería haber en caja según el sistema, por todas las rutas"
          icon={<FiActivity size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Caja + Cuentas"
          value={formatCLP(totalCajaMasCuentas)}
          tooltip="Caja efectivo de todas las rutas + saldos en cuentas bancarias"
          icon={<FiDollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title={cuadrado ? "Cuadrado" : favor ? "Saldo a Favor" : "Saldo en Contra"}
          value={formatCLP(Math.abs(saldoCalculado))}
          subtitle={
            cuadrado
              ? "Todo cuadrado"
              : favor
              ? "Tienes más efectivo del esperado"
              : "Falta efectivo vs sistema"
          }
          tooltip="Diferencia entre el efectivo real (caja + cuentas) y lo que debería haber según el sistema"
          icon={cuadrado ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          color={cuadrado ? "emerald" : favor ? "emerald" : "rose"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Terminales / Rutas */}
        {terminales.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FiActivity size={15} className="text-blue-400" />
                Rutas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {/* Column header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 text-xs text-muted-foreground">
                <span>Ruta</span>
                <span className="hidden sm:block text-right">Caja Sistema</span>
                <span className="hidden sm:block text-right">Caja Efectivo</span>
                <span className="text-right">Diferencia</span>
              </div>
              {terminales.map((t) => {
                const diff = t.caja - t.sistema;
                return (
                  <div key={t.nombre} className="grid grid-cols-2 sm:grid-cols-4 items-center gap-2 py-3">
                    <span className="font-medium text-sm">{t.nombre}</span>
                    <span className="hidden sm:block font-mono text-sm text-right text-muted-foreground">
                      {formatCLP(t.sistema)}
                    </span>
                    <span className="hidden sm:block font-mono text-sm text-right">
                      {formatCLP(t.caja)}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold text-right",
                        diff === 0
                          ? "text-emerald-400"
                          : diff > 0
                          ? "text-blue-400"
                          : "text-rose-400"
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {formatCLP(diff)}
                    </span>
                  </div>
                );
              })}
              {/* Totals row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 items-center gap-2 pt-3">
                <span className="text-xs text-muted-foreground font-semibold">Total</span>
                <span className="hidden sm:block font-mono text-sm font-semibold text-right text-blue-400">
                  {formatCLP(terminales.reduce((s, t) => s + t.sistema, 0))}
                </span>
                <span className="hidden sm:block font-mono text-sm font-semibold text-right text-emerald-400">
                  {formatCLP(terminales.reduce((s, t) => s + t.caja, 0))}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold text-right",
                    (() => {
                      const d = terminales.reduce((s, t) => s + (t.caja - t.sistema), 0);
                      return d === 0 ? "text-emerald-400" : d > 0 ? "text-blue-400" : "text-rose-400";
                    })()
                  )}
                >
                  {(() => {
                    const d = terminales.reduce((s, t) => s + (t.caja - t.sistema), 0);
                    return `${d > 0 ? "+" : ""}${formatCLP(d)}`;
                  })()}
                </span>
              </div>
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
            <CardContent className="space-y-0 divide-y divide-border">
              {cuentas.map((c) => (
                <div
                  key={c.nombre}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-muted-foreground">{c.nombre}</span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      c.saldo > 0 ? "text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    {c.saldo > 0 ? formatCLP(c.saldo) : "—"}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 text-sm font-semibold">
                <span>Total cuentas</span>
                <span className={cn("font-mono", totalCuentasSaldo > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                  {formatCLP(totalCuentasSaldo)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Balance general detallado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Balance General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            <div className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">Total Sistema (rutas)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Lo que debería haber en caja según el sistema</p>
              </div>
              <span className="font-mono font-semibold text-blue-400">{formatCLP(totalTerminales)}</span>
            </div>
            <div className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">Total Caja + Cuentas</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Caja efectivo rutas ({formatCLP(terminales.reduce((s,t)=>s+t.caja,0))}) + cuentas bancarias ({formatCLP(totalCuentasSaldo)})
                </p>
              </div>
              <span className="font-mono font-semibold text-emerald-400">{formatCLP(totalCajaMasCuentas)}</span>
            </div>
            <div className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">
                  {cuadrado ? "Cuadrado ✓" : favor ? "Saldo a Favor" : "Saldo en Contra"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cuadrado
                    ? "El efectivo coincide exactamente con el sistema"
                    : favor
                    ? "Tienes más efectivo del que debería haber"
                    : "Falta efectivo — revisar administración del dinero"}
                </p>
              </div>
              <span
                className={cn(
                  "font-mono font-semibold text-lg",
                  cuadrado ? "text-emerald-400" : favor ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {favor ? "+" : cuadrado ? "" : "-"}{formatCLP(Math.abs(saldoCalculado))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico mensual */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Histórico mensual</h2>
        <CuadreCajaCharts monthly2025={monthly2025} monthly2026={monthly2026} />
      </div>
    </div>
  );
}
