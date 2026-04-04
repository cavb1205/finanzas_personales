import {
  FiTruck,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getControlBusetas } from "@/lib/sheets";
import { formatCOP, formatNumber } from "@/lib/format";
import BusetasTable from "./BusetasTable";

export const revalidate = 300;

export default async function BusetasPage() {
  const entries = await getControlBusetas();

  const totalBruto = entries.reduce((s, e) => s + e.brutoTotal, 0);
  const totalGastos = entries.reduce((s, e) => s + e.totalGastos, 0);
  const totalNeto = entries.reduce((s, e) => s + e.netoTotal, 0);
  const totalPasajeros = entries.reduce((s, e) => s + e.pasajeros, 0);
  const totalViajes = entries.filter((e) => e.brutoTotal > 0).length;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Control Busetas</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ingreso Bruto"
          value={formatCOP(totalBruto)}
          subtitle={`${totalViajes} viajes`}
          icon={<FiDollarSign size={24} />}
          color="blue"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCOP(totalGastos)}
          icon={<FiTruck size={24} />}
          color="rose"
        />
        <DashboardCard
          title="Neto"
          value={formatCOP(totalNeto)}
          icon={<FiTrendingUp size={24} />}
          color={totalNeto >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Pasajeros"
          value={formatNumber(totalPasajeros)}
          subtitle={`Promedio: ${totalViajes > 0 ? formatNumber(Math.round(totalPasajeros / totalViajes)) : 0}/viaje`}
          icon={<FiUsers size={24} />}
          color="indigo"
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">
        Detalle de Viajes
      </h2>
      <BusetasTable entries={entries} />
    </div>
  );
}
