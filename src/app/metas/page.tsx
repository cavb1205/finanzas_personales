import { FiTarget, FiHome, FiDollarSign, FiCalendar, FiTrendingUp } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getApartamento } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MetasCharts from "./MetasCharts";
import { cn } from "@/lib/utils";

export const revalidate = 300;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatFecha(date: Date): string {
  return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

export default async function MetasPage() {
  const apartamento = await getApartamento();

  const percent =
    apartamento.valorTotal > 0
      ? (apartamento.totalAportado / apartamento.valorTotal) * 100
      : 0;

  // Ritmo promedio real (solo meses con aporte > 0)
  const aportesConValor = apartamento.aportesMensuales.filter((a) => a.valor > 0);
  const ritmoPromedio =
    aportesConValor.length > 0
      ? aportesConValor.reduce((s, a) => s + a.valor, 0) / aportesConValor.length
      : 0;

  // Último aporte registrado
  const ultimoAporte = aportesConValor[aportesConValor.length - 1]?.valor ?? 0;

  // Meses restantes según ritmo promedio
  const mesesRestantesPromedio =
    ritmoPromedio > 0 ? Math.ceil(apartamento.saldoPendiente / ritmoPromedio) : null;

  // Fecha estimada de llegada
  const fechaEstimada =
    mesesRestantesPromedio !== null
      ? formatFecha(addMonths(new Date(), mesesRestantesPromedio))
      : null;

  // Proyecciones fijas
  const proyecciones = [
    { label: "$20M / mes", monto: 20_000_000 },
    { label: "$15M / mes", monto: 15_000_000 },
    { label: "$10M / mes", monto: 10_000_000 },
  ].map(({ label, monto }) => ({
    label,
    meses: Math.ceil(apartamento.saldoPendiente / monto),
    fecha: formatFecha(addMonths(new Date(), Math.ceil(apartamento.saldoPendiente / monto))),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Metas de Ahorro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seguimiento de tu meta para el apartamento
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Valor Apartamento"
          value={formatCOP(apartamento.valorTotal)}
          icon={<FiHome size={20} />}
          color="purple"
        />
        <DashboardCard
          title="Meta Cuota Inicial"
          value={formatCOP(apartamento.meta)}
          icon={<FiTarget size={20} />}
          color="indigo"
        />
        <DashboardCard
          title="Aportado"
          value={formatCOP(apartamento.totalAportado)}
          subtitle={`${aportesConValor.length} aportes realizados`}
          icon={<FiDollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Saldo Pendiente"
          value={formatCOP(apartamento.saldoPendiente)}
          subtitle={fechaEstimada ? `Est. ${fechaEstimada}` : undefined}
          icon={<FiTarget size={20} />}
          color="amber"
        />
      </div>

      {/* Progreso + notificación */}
      <Card>
        <CardHeader>
          <CardTitle>Apartamento</CardTitle>
          <CardDescription>
            Valor total: {formatCOP(apartamento.valorTotal)} · Meta cuota inicial:{" "}
            {formatCOP(apartamento.meta)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barra de progreso */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <span className="text-4xl font-bold font-mono text-purple-400">
                {percent.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {formatCOP(apartamento.totalAportado)} / {formatCOP(apartamento.valorTotal)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>

          {/* Ritmo actual */}
          {ritmoPromedio > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiTrendingUp size={14} className="text-emerald-400" />
                  <p className="text-xs text-muted-foreground">Ritmo promedio real</p>
                </div>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {formatCOP(Math.round(ritmoPromedio))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">por mes</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiDollarSign size={14} className="text-blue-400" />
                  <p className="text-xs text-muted-foreground">Último aporte</p>
                </div>
                <p className="text-xl font-bold font-mono text-blue-400">
                  {formatCOP(ultimoAporte)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">mes más reciente</p>
              </div>
              {mesesRestantesPromedio !== null && (
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FiCalendar size={14} className="text-purple-400" />
                    <p className="text-xs text-muted-foreground">A tu ritmo actual</p>
                  </div>
                  <p className="text-xl font-bold font-mono text-purple-400">
                    {mesesRestantesPromedio} meses
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Est. {fechaEstimada}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proyecciones fijas */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Proyecciones según aporte mensual
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {proyecciones.map(({ label, meses, fecha }) => (
                <div key={label} className="rounded-lg bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold font-mono mt-1">{meses} meses</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fecha}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de progreso */}
      <MetasCharts
        aportes={apartamento.aportesMensuales}
        meta={apartamento.meta}
      />

      {/* Historial */}
      {apartamento.aportesMensuales.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Historial de Aportes</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Aporte</TableHead>
                  <TableHead className="text-right">Acumulado</TableHead>
                  <TableHead className="text-right">% del total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartamento.aportesMensuales.map((a, i) => {
                  const pctTotal =
                    apartamento.valorTotal > 0
                      ? (a.acumulado / apartamento.valorTotal) * 100
                      : 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="capitalize font-medium text-sm">{a.mes}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {a.valor > 0 ? (
                          <span className="text-emerald-400">{formatCOP(a.valor)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCOP(a.acumulado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                pctTotal >= 100 ? "bg-emerald-500" : "bg-purple-500"
                              )}
                              style={{ width: `${Math.min(pctTotal, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                            {pctTotal.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
