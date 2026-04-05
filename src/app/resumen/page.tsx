import {
  FiDollarSign, FiGlobe, FiTrendingUp, FiTrendingDown,
  FiTarget, FiUsers, FiPercent, FiPieChart,
} from "react-icons/fi";
import {
  getCajaChile, getCajaColombia, getPrestamos,
  getPortafolio, getApartamento,
} from "@/lib/sheets";
import { formatCLP, formatCOP, formatUSD, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const revalidate = 300;

function KpiRow({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            positive === true
              ? "text-emerald-400"
              : positive === false
              ? "text-rose-400"
              : "text-foreground"
          )}
        >
          {value}
        </span>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default async function ResumenPage() {
  const [chile, colombia, prestamos, portafolio, apartamento] = await Promise.all([
    getCajaChile(),
    getCajaColombia(),
    getPrestamos(),
    getPortafolio(),
    getApartamento(),
  ]);

  const now = new Date();
  const fechaStr = now.toLocaleDateString("es-CL", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Caja Chile
  const chileIngresos = chile.transactions.reduce((s, t) => s + t.ingreso, 0);
  const chileGastos = chile.transactions.reduce((s, t) => s + t.gasto, 0);
  const chileSaldo = chileIngresos - chileGastos;
  const lastChile = chile.summary[chile.summary.length - 1];
  const tasaAhorro = lastChile?.ingresos > 0
    ? (lastChile.saldo / lastChile.ingresos) * 100
    : null;

  // Caja Colombia
  const colIngresos = colombia.transactions.reduce((s, t) => s + t.ingreso, 0);
  const colGastos = colombia.transactions.reduce((s, t) => s + t.gasto, 0);
  const colSaldo = colIngresos - colGastos;

  // Préstamos
  const totalPrestamos = prestamos.resumen.reduce((s, p) => s + p.saldoPendiente, 0);
  const prestamosActivos = prestamos.resumen.filter((p) => p.saldoPendiente > 0).length;

  // Apartamento
  const aptPercent = apartamento.valorTotal > 0
    ? (apartamento.totalAportado / apartamento.valorTotal) * 100
    : 0;
  const aportesConValor = apartamento.aportesMensuales.filter((a) => a.valor > 0);
  const ritmo = aportesConValor.length > 0
    ? aportesConValor.reduce((s, a) => s + a.valor, 0) / aportesConValor.length
    : 0;
  const mesesRestantes = ritmo > 0
    ? Math.ceil(apartamento.saldoPendiente / ritmo)
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen Ejecutivo</h1>
          <p className="text-muted-foreground text-sm mt-1">{fechaStr}</p>
        </div>
        <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-1">
          Actualizado cada 5 min
        </span>
      </div>

      <Separator />

      {/* Tasa de ahorro destacada */}
      {tasaAhorro !== null && (
        <div
          className={cn(
            "rounded-xl border p-6 flex items-center justify-between",
            tasaAhorro >= 20
              ? "border-emerald-500/30 bg-emerald-500/5"
              : tasaAhorro >= 0
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-rose-500/30 bg-rose-500/5"
          )}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Tasa de ahorro — {lastChile?.month}
            </p>
            <p
              className={cn(
                "text-5xl font-bold font-mono",
                tasaAhorro >= 20
                  ? "text-emerald-400"
                  : tasaAhorro >= 0
                  ? "text-amber-400"
                  : "text-rose-400"
              )}
            >
              {tasaAhorro.toFixed(1)}%
            </p>
          </div>
          <FiPercent
            size={48}
            className={cn(
              "opacity-20",
              tasaAhorro >= 20
                ? "text-emerald-400"
                : tasaAhorro >= 0
                ? "text-amber-400"
                : "text-rose-400"
            )}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Caja Chile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FiDollarSign size={15} className="text-emerald-400" />
              Caja Chile (CLP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KpiRow label="Ingresos totales" value={formatCLP(chileIngresos)} positive={true} />
            <KpiRow label="Gastos totales" value={formatCLP(chileGastos)} positive={false} />
            <KpiRow
              label="Saldo neto"
              value={formatCLP(chileSaldo)}
              positive={chileSaldo >= 0}
            />
            {lastChile && (
              <>
                <KpiRow
                  label={`Ingresos ${lastChile.month}`}
                  value={formatCLP(lastChile.ingresos)}
                  positive={true}
                />
                <KpiRow
                  label={`Gastos ${lastChile.month}`}
                  value={formatCLP(lastChile.gastos)}
                  positive={false}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Caja Colombia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FiGlobe size={15} className="text-blue-400" />
              Caja Colombia (COP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KpiRow label="Ingresos totales" value={formatCOP(colIngresos)} positive={true} />
            <KpiRow label="Gastos totales" value={formatCOP(colGastos)} positive={false} />
            <KpiRow
              label="Saldo neto"
              value={formatCOP(colSaldo)}
              positive={colSaldo >= 0}
            />
            <KpiRow
              label="Inversión busetas"
              value={formatCOP(colombia.investmentSummary.totalInvertido)}
            />
            <KpiRow
              label="Recuperado"
              value={`${colombia.investmentSummary.porcentajeRecuperacion.toFixed(1)}%`}
              positive={colombia.investmentSummary.porcentajeRecuperacion > 50}
            />
          </CardContent>
        </Card>

        {/* Portafolio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FiTrendingUp size={15} className="text-indigo-400" />
              Portafolio (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KpiRow label="Total invertido" value={formatUSD(portafolio.resumen.inversionTotal)} />
            <KpiRow
              label="Valor actual"
              value={formatUSD(portafolio.resumen.valorActual)}
              positive={portafolio.resumen.ganancia >= 0}
            />
            <KpiRow
              label="Ganancia / Pérdida"
              value={formatUSD(portafolio.resumen.ganancia)}
              positive={portafolio.resumen.ganancia >= 0}
            />
            <KpiRow
              label="Rendimiento"
              value={formatPercent(portafolio.resumen.gananciaPercent)}
              positive={portafolio.resumen.gananciaPercent >= 0}
            />
            {["GOOG", "BTC"].map((etf) => {
              const entries = portafolio.entries.filter((e) => e.etf === etf);
              const pct =
                entries.reduce((s, e) => s + e.inversionInicial, 0) > 0
                  ? (entries.reduce((s, e) => s + e.ganancia, 0) /
                      entries.reduce((s, e) => s + e.inversionInicial, 0)) *
                    100
                  : 0;
              return (
                <KpiRow
                  key={etf}
                  label={`  ${etf}`}
                  value={formatPercent(pct)}
                  positive={pct >= 0}
                />
              );
            })}
          </CardContent>
        </Card>

        {/* Metas y préstamos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FiTarget size={15} className="text-purple-400" />
              Metas y Obligaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KpiRow
              label="Apartamento — progreso"
              value={`${aptPercent.toFixed(1)}%`}
              sub={`${formatCOP(apartamento.totalAportado)} de ${formatCOP(apartamento.valorTotal)}`}
              positive={aptPercent >= 50}
            />
            <KpiRow
              label="Saldo pendiente apt."
              value={formatCOP(apartamento.saldoPendiente)}
              positive={false}
            />
            {mesesRestantes !== null && (
              <KpiRow
                label="Est. llegada a meta"
                value={`${mesesRestantes} meses`}
                sub={`Ritmo promedio ${formatCOP(Math.round(ritmo))}/mes`}
              />
            )}
            <KpiRow
              label="Préstamos pendientes"
              value={formatCOP(totalPrestamos)}
              sub={`${prestamosActivos} persona${prestamosActivos !== 1 ? "s" : ""} con saldo activo`}
              positive={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Activos vs Pasivos summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FiPieChart size={15} className="text-amber-400" />
            Estado Patrimonial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Activos
              </p>
              <KpiRow label="Saldo Caja Chile" value={formatCLP(chileSaldo)} positive={chileSaldo >= 0} />
              <KpiRow label="Saldo Caja Colombia" value={formatCOP(colSaldo)} positive={colSaldo >= 0} />
              <KpiRow label="Portafolio" value={formatUSD(portafolio.resumen.valorActual)} positive={true} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Pasivos
              </p>
              <KpiRow label="Préstamos pendientes" value={formatCOP(totalPrestamos)} positive={false} />
              <KpiRow label="Deuda apartamento" value={formatCOP(apartamento.saldoPendiente)} positive={false} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
