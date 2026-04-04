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

  const chileTotalIngresos = chile.transactions.reduce(
    (sum, t) => sum + t.ingreso,
    0
  );
  const chileTotalGastos = chile.transactions.reduce(
    (sum, t) => sum + t.gasto,
    0
  );
  const chileSaldo = chileTotalIngresos - chileTotalGastos;

  const colombiaTotalIngresos = colombia.transactions.reduce(
    (sum, t) => sum + t.ingreso,
    0
  );
  const colombiaTotalGastos = colombia.transactions.reduce(
    (sum, t) => sum + t.gasto,
    0
  );
  const colombiaSaldo = colombiaTotalIngresos - colombiaTotalGastos;

  const totalPendientePrestamos = prestamos.resumen.reduce(
    (sum, p) => sum + p.saldoPendiente,
    0
  );

  const portafolioPercent = portafolio.resumen.gananciaPercent;
  const portafolioTotal = portafolio.resumen.valorActual;
  const portafolioInvertido = portafolio.resumen.inversionTotal;
  const portafolioGanancia = portafolio.resumen.ganancia;

  const apartamentoPercent =
    apartamento.valorTotal > 0
      ? (apartamento.totalAportado / apartamento.valorTotal) * 100
      : 0;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Caja Chile (CLP)"
          value={formatCLP(chileSaldo)}
          subtitle={`Ingresos: ${formatCLP(chileTotalIngresos)} | Gastos: ${formatCLP(chileTotalGastos)}`}
          icon={<FiDollarSign size={24} />}
          color={chileSaldo >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Caja Colombia (COP)"
          value={formatCOP(colombiaSaldo)}
          subtitle={`Ingresos: ${formatCOP(colombiaTotalIngresos)} | Gastos: ${formatCOP(colombiaTotalGastos)}`}
          icon={<FiGlobe size={24} />}
          color={colombiaSaldo >= 0 ? "blue" : "rose"}
        />
        <DashboardCard
          title="Portafolio (USD)"
          value={formatUSD(portafolioTotal)}
          subtitle={`Invertido: ${formatUSD(portafolioInvertido)} | ${formatPercent(portafolioPercent)}`}
          icon={<FiTrendingUp size={24} />}
          color={portafolioGanancia >= 0 ? "indigo" : "rose"}
        />
        <DashboardCard
          title="Préstamos Pendientes"
          value={formatCOP(totalPendientePrestamos)}
          subtitle={`${prestamos.resumen.filter((p) => p.saldoPendiente > 0).length} personas con saldo`}
          icon={<FiUsers size={24} />}
          color="amber"
        />
        <DashboardCard
          title="Meta Apartamento"
          value={`${apartamentoPercent.toFixed(1)}%`}
          subtitle={`${formatCOP(apartamento.totalAportado)} de ${formatCOP(apartamento.valorTotal)}`}
          icon={<FiTarget size={24} />}
          color="purple"
        />
        <DashboardCard
          title="Inv. Busetas (COP)"
          value={formatCOP(colombia.investmentSummary.totalInvertido)}
          subtitle={`Recuperado: ${formatCOP(colombia.investmentSummary.recuperado)} (${colombia.investmentSummary.porcentajeRecuperacion}%)`}
          icon={<FiTruck size={24} />}
          color="blue"
        />
      </div>

      <div className="mt-8">
        <DashboardCharts summary={chile.summary} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Préstamos - Resumen
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                  Persona
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  Deuda Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  Pagado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                  Pendiente
                </th>
              </tr>
            </thead>
            <tbody>
              {prestamos.resumen.map((p) => (
                <tr
                  key={p.persona}
                  className="border-b border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {p.persona}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatCOP(p.deudaTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400">
                    {formatCOP(p.totalPagado)}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-400">
                    {formatCOP(p.saldoPendiente)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
