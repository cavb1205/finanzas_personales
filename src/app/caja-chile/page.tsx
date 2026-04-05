import { FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import RankingSection from "./RankingSection";
import { getCajaChile } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import CajaChileCharts from "./CajaChileCharts";
import ProyeccionCard from "./ProyeccionCard";
import AlertaGasto from "./AlertaGasto";
import ExportCsvButton from "@/components/ExportCsvButton";
import ComparacionMeses from "./ComparacionMeses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 300;

function deltaPct(current: number, previous: number): string | undefined {
  if (!previous || previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs mes anterior`;
}

export default async function CajaChilePage() {
  const { transactions, summary } = await getCajaChile();

  const totalIngresos = transactions.reduce((s, t) => s + t.ingreso, 0);
  const totalGastos = transactions.reduce((s, t) => s + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  // Current month key "2026-04"
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Last two months from summary for delta comparison
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Caja Chile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ingresos y gastos en pesos chilenos
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Ingresos"
          value={formatCLP(totalIngresos)}
          subtitle={deltaIngresos}
          icon={<FiTrendingUp size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCLP(totalGastos)}
          subtitle={deltaGastos}
          icon={<FiTrendingDown size={20} />}
          color="rose"
        />
        <DashboardCard
          title="Saldo"
          value={formatCLP(saldo)}
          subtitle={deltaSaldo}
          icon={<FiDollarSign size={20} />}
          color={saldo >= 0 ? "emerald" : "rose"}
        />
      </div>

      <AlertaGasto summary={summary} />

      <ProyeccionCard summary={summary} currentMonthKey={currentMonthKey} />

      <Tabs defaultValue="graficos">
        <TabsList>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="ranking">Distribución</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="mt-6 space-y-6">
          <CajaChileCharts summary={summary} transactions={transactions} />
          <ComparacionMeses summary={summary} />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <RankingSection transactions={transactions} />
        </TabsContent>

        <TabsContent value="transacciones" className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <ExportCsvButton transactions={transactions} filename="caja-chile" />
          </div>
          <TransactionTable transactions={transactions} currency="CLP" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
