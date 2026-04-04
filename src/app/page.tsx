import {
  FiDollarSign,
  FiGlobe,
  FiTrendingUp,
  FiTarget,
  FiUsers,
  FiTruck,
} from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import {
  getCajaChile,
  getCajaColombia,
  getPrestamos,
  getPortafolio,
  getApartamento,
} from "@/lib/sheets";
import { formatCLP, formatCOP, formatUSD, formatPercent } from "@/lib/format";
import DashboardCharts from "./DashboardCharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const revalidate = 300;

export default async function Dashboard() {
  const [chile, colombia, prestamos, portafolio, apartamento] =
    await Promise.all([
      getCajaChile(),
      getCajaColombia(),
      getPrestamos(),
      getPortafolio(),
      getApartamento(),
    ]);

  const chileTotalIngresos = chile.transactions.reduce((s, t) => s + t.ingreso, 0);
  const chileTotalGastos = chile.transactions.reduce((s, t) => s + t.gasto, 0);
  const chileSaldo = chileTotalIngresos - chileTotalGastos;

  const colombiaTotalIngresos = colombia.transactions.reduce((s, t) => s + t.ingreso, 0);
  const colombiaTotalGastos = colombia.transactions.reduce((s, t) => s + t.gasto, 0);
  const colombiaSaldo = colombiaTotalIngresos - colombiaTotalGastos;

  const totalPendientePrestamos = prestamos.resumen.reduce(
    (s, p) => s + p.saldoPendiente,
    0
  );

  const apartamentoPercent =
    apartamento.valorTotal > 0
      ? (apartamento.totalAportado / apartamento.valorTotal) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen de tus finanzas en Chile, Colombia e inversiones
        </p>
      </div>

      <Separator />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Caja Chile"
          value={formatCLP(chileSaldo)}
          subtitle={`↑ ${formatCLP(chileTotalIngresos)}  ↓ ${formatCLP(chileTotalGastos)}`}
          icon={<FiDollarSign size={20} />}
          color={chileSaldo >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Caja Colombia"
          value={formatCOP(colombiaSaldo)}
          subtitle={`↑ ${formatCOP(colombiaTotalIngresos)}  ↓ ${formatCOP(colombiaTotalGastos)}`}
          icon={<FiGlobe size={20} />}
          color={colombiaSaldo >= 0 ? "blue" : "rose"}
        />
        <DashboardCard
          title="Portafolio"
          value={formatUSD(portafolio.resumen.valorActual)}
          subtitle={`Invertido ${formatUSD(portafolio.resumen.inversionTotal)} · ${formatPercent(portafolio.resumen.gananciaPercent)}`}
          icon={<FiTrendingUp size={20} />}
          color={portafolio.resumen.ganancia >= 0 ? "indigo" : "rose"}
        />
        <DashboardCard
          title="Préstamos pendientes"
          value={formatCOP(totalPendientePrestamos)}
          subtitle={`${prestamos.resumen.filter((p) => p.saldoPendiente > 0).length} personas con saldo activo`}
          icon={<FiUsers size={20} />}
          color="amber"
        />
        <DashboardCard
          title="Meta Apartamento"
          value={`${apartamentoPercent.toFixed(1)}%`}
          subtitle={`${formatCOP(apartamento.totalAportado)} de ${formatCOP(apartamento.valorTotal)}`}
          icon={<FiTarget size={20} />}
          color="purple"
        />
        <DashboardCard
          title="Inversión Busetas"
          value={formatCOP(colombia.investmentSummary.totalInvertido)}
          subtitle={`Recuperado ${formatCOP(colombia.investmentSummary.recuperado)} · ${colombia.investmentSummary.porcentajeRecuperacion.toFixed(2)}%`}
          icon={<FiTruck size={20} />}
          color="blue"
        />
      </div>

      {/* Chart */}
      <DashboardCharts summary={chile.summary} />

      {/* Préstamos + Portafolio resumen */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Préstamos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Préstamos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead className="text-right">Deuda</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestamos.resumen.map((p) => (
                  <TableRow key={p.persona}>
                    <TableCell className="font-medium">{p.persona}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatCOP(p.deudaTotal)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-400">
                      {formatCOP(p.totalPagado)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {p.saldoPendiente > 0 ? (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 font-mono text-xs">
                          {formatCOP(p.saldoPendiente)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                          Saldado
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Portafolio resumen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Portafolio por Activo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["GOOG", "BTC"] as const).map((etf) => {
              const etfEntries = portafolio.entries.filter((e) => e.etf === etf);
              const invertido = etfEntries.reduce((s, e) => s + e.inversionInicial, 0);
              const actual = etfEntries.reduce((s, e) => s + e.valorActual, 0);
              const ganancia = etfEntries.reduce((s, e) => s + e.ganancia, 0);
              const pct = invertido > 0 ? (ganancia / invertido) * 100 : 0;
              return (
                <div key={etf} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{etf}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Invertido {formatUSD(invertido)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold">{formatUSD(actual)}</p>
                    <p className={`text-xs font-mono ${pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatPercent(pct)}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
