import { FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import MonthlyChart from "@/components/MonthlyChart";
import { getCajaChile } from "@/lib/sheets";
import { formatCLP } from "@/lib/format";
import CajaChileCharts from "./CajaChileCharts";

export const revalidate = 300;

export default async function CajaChilePage() {
  const { transactions, summary } = await getCajaChile();

  const totalIngresos = transactions.reduce((sum, t) => sum + t.ingreso, 0);
  const totalGastos = transactions.reduce((sum, t) => sum + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Caja Chile</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Ingresos"
          value={formatCLP(totalIngresos)}
          icon={<FiTrendingUp size={24} />}
          color="emerald"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCLP(totalGastos)}
          icon={<FiTrendingDown size={24} />}
          color="rose"
        />
        <DashboardCard
          title="Saldo"
          value={formatCLP(saldo)}
          icon={<FiDollarSign size={24} />}
          color={saldo >= 0 ? "emerald" : "rose"}
        />
      </div>

      <div className="mb-8">
        <CajaChileCharts summary={summary} />
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">Transacciones</h2>
      <TransactionTable transactions={transactions} currency="CLP" />
    </div>
  );
}
