import {
  FiGlobe,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiDollarSign,
} from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import RankingSection from "@/app/caja-chile/RankingSection";
import { getCajaColombia } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
// formatCOP is used server-side only (cards, remesa, investment summary)
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CajaColombiaCharts from "./CajaColombiaCharts";
import AlertaGasto from "@/app/caja-chile/AlertaGasto";
import ProyeccionCard from "@/app/caja-chile/ProyeccionCard";
import ExportCsvButton from "@/components/ExportCsvButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 300;

function deltaPct(current: number, previous: number): string | undefined {
  if (!previous || previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs mes anterior`;
}

export default async function CajaColombiaPage() {
  const { transactions, summary, investmentSummary, remesaDetalle } =
    await getCajaColombia();


  const totalIngresos = transactions.reduce((s, t) => s + t.ingreso, 0);
  const totalGastos = transactions.reduce((s, t) => s + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const lastMonth = summary[summary.length - 1];
  const prevMonth = summary[summary.length - 2];

  const deltaIngresos =
    lastMonth && prevMonth
      ? deltaPct(lastMonth.ingresos, prevMonth.ingresos)
      : undefined;
  const deltaGastos =
    lastMonth && prevMonth
      ? deltaPct(lastMonth.gastos, prevMonth.gastos)
      : undefined;
  const deltaSaldo =
    lastMonth && prevMonth
      ? deltaPct(lastMonth.saldo, prevMonth.saldo)
      : undefined;

  // Mes actual — Colombia usa DD/MM (sin año) o DD/MM/YYYY
  const mesActualTx = transactions.filter((t) => {
    const sep = t.fecha.includes("/") ? "/" : "-";
    const parts = t.fecha.split(sep);
    if (parts.length === 2) {
      // DD/MM — inferir año actual
      return `${now.getFullYear()}-${parts[1].padStart(2, "0")}` === currentMonthKey;
    }
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}` === currentMonthKey;
      }
      return `${parts[2]}-${parts[1].padStart(2, "0")}` === currentMonthKey;
    }
    return false;
  });
  const mesIngresos = mesActualTx.reduce((s, t) => s + t.ingreso, 0);
  const mesGastos = mesActualTx.reduce((s, t) => s + t.gasto, 0);
  const mesSaldo = mesIngresos - mesGastos;
  const mesLabel = now.toLocaleDateString("es-CO", { month: "long" });
  const hasMesActual = mesActualTx.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Caja Colombia</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ingresos y gastos en pesos colombianos
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ingresos"
          value={hasMesActual ? formatCOP(mesIngresos) : formatCOP(totalIngresos)}
          subtitle={hasMesActual ? `${mesLabel} en curso` : deltaIngresos}
          icon={<FiTrendingUp size={20} />}
          color="emerald"
          secondary={hasMesActual ? { label: "Total acumulado", value: formatCOP(totalIngresos) } : undefined}
        />
        <DashboardCard
          title="Gastos"
          value={hasMesActual ? formatCOP(mesGastos) : formatCOP(totalGastos)}
          subtitle={hasMesActual ? `${mesLabel} en curso` : deltaGastos}
          icon={<FiTrendingDown size={20} />}
          color="rose"
          secondary={hasMesActual ? { label: "Total acumulado", value: formatCOP(totalGastos) } : undefined}
        />
        <DashboardCard
          title="Saldo"
          value={hasMesActual ? formatCOP(mesSaldo) : formatCOP(saldo)}
          subtitle={hasMesActual ? `${mesLabel} en curso` : deltaSaldo}
          icon={<FiGlobe size={20} />}
          color={hasMesActual ? (mesSaldo >= 0 ? "blue" : "rose") : (saldo >= 0 ? "blue" : "rose")}
          secondary={hasMesActual ? { label: "Total acumulado", value: formatCOP(saldo) } : undefined}
        />
        <DashboardCard
          title="Inversión Busetas"
          value={formatCOP(investmentSummary.totalInvertido)}
          subtitle={`Recuperado ${investmentSummary.porcentajeRecuperacion.toFixed(2)}%`}
          icon={<FiPieChart size={20} />}
          color="indigo"
        />
      </div>

      <AlertaGasto summary={summary} />

      <ProyeccionCard summary={summary} currentMonthKey={currentMonthKey} />

      {/* Detalle remesa + recuperación inversión */}
      {(remesaDetalle.length > 0 || investmentSummary.totalInvertido > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {remesaDetalle.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Detalle Remesa Mensual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {remesaDetalle.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{r.motivo}</span>
                    <span className="font-mono font-medium">
                      {formatCOP(r.valor)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {investmentSummary.totalInvertido > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FiDollarSign size={16} />
                  Recuperación Inversión Busetas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Total invertido", valor: formatCOP(investmentSummary.totalInvertido) },
                    { label: "Recuperado", valor: formatCOP(investmentSummary.recuperado), green: true },
                    { label: "Saldo por recuperar", valor: formatCOP(investmentSummary.saldoPorRecuperar) },
                  ].map(({ label, valor, green }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-mono font-semibold ${green ? "text-emerald-400" : ""}`}>
                        {valor}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso</span>
                    <span>{investmentSummary.porcentajeRecuperacion.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.min(investmentSummary.porcentajeRecuperacion, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="graficos">
        <TabsList>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="ranking">Distribución</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="mt-6">
          <CajaColombiaCharts summary={summary} transactions={transactions} />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <RankingSection transactions={transactions} currency="COP" />
        </TabsContent>

        <TabsContent value="transacciones" className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <ExportCsvButton
              transactions={transactions}
              filename="caja-colombia"
            />
          </div>
          <TransactionTable transactions={transactions} currency="COP" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
