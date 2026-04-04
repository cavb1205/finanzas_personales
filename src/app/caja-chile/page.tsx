import { FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import { getCajaChile } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import CajaChileCharts from "./CajaChileCharts";

export const revalidate = 300;

export default async function CajaChilePage() {
  const { transactions, summary } = await getCajaChile();

  const totalIngresos = transactions.reduce((s, t) => s + t.ingreso, 0);
  const totalGastos = transactions.reduce((s, t) => s + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Caja Chile</h1>
        <p className="text-muted-foreground text-sm mt-1">Ingresos y gastos en pesos chilenos</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Ingresos"
          value={formatCLP(totalIngresos)}
          icon={<FiTrendingUp size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCLP(totalGastos)}
          icon={<FiTrendingDown size={20} />}
          color="rose"
        />
        <DashboardCard
          title="Saldo"
          value={formatCLP(saldo)}
          icon={<FiDollarSign size={20} />}
          color={saldo >= 0 ? "emerald" : "rose"}
        />
      </div>

      <CajaChileCharts summary={summary} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transacciones</h2>
        <TransactionTable transactions={transactions} currency="CLP" />
      </div>
    </div>
  );
}
