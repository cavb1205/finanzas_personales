import {
  FiGlobe,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
} from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import { getCajaColombia } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";

export const revalidate = 300;

export default async function CajaColombiaPage() {
  const { transactions, investmentSummary } = await getCajaColombia();

  const totalIngresos = transactions.reduce((sum, t) => sum + t.ingreso, 0);
  const totalGastos = transactions.reduce((sum, t) => sum + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Caja Colombia</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Ingresos"
          value={formatCOP(totalIngresos)}
          icon={<FiTrendingUp size={24} />}
          color="emerald"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCOP(totalGastos)}
          icon={<FiTrendingDown size={24} />}
          color="rose"
        />
        <DashboardCard
          title="Saldo"
          value={formatCOP(saldo)}
          icon={<FiGlobe size={24} />}
          color={saldo >= 0 ? "blue" : "rose"}
        />
        <DashboardCard
          title="Inversión Busetas"
          value={formatCOP(investmentSummary.totalInvertido)}
          subtitle={`Recuperado: ${investmentSummary.porcentajeRecuperacion}%`}
          icon={<FiPieChart size={24} />}
          color="indigo"
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">Transacciones</h2>
      <TransactionTable transactions={transactions} currency="COP" />
    </div>
  );
}
