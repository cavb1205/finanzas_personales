import { FiTarget, FiHome, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getApartamento } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";

export const revalidate = 300;

export default async function MetasPage() {
  const apartamento = await getApartamento();
  const percent =
    apartamento.valorTotal > 0
      ? (apartamento.totalAportado / apartamento.valorTotal) * 100
      : 0;
  const faltante = apartamento.saldoPendiente;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Metas de Ahorro</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Valor Apartamento"
          value={formatCOP(apartamento.valorTotal)}
          icon={<FiHome size={24} />}
          color="purple"
        />
        <DashboardCard
          title="Ahorro Inicial"
          value={formatCOP(apartamento.meta)}
          subtitle="Meta cuota inicial"
          icon={<FiTarget size={24} />}
          color="indigo"
        />
        <DashboardCard
          title="Aportado"
          value={formatCOP(apartamento.totalAportado)}
          icon={<FiDollarSign size={24} />}
          color="emerald"
        />
        <DashboardCard
          title="Saldo Pendiente"
          value={formatCOP(faltante)}
          icon={<FiTarget size={24} />}
          color="amber"
        />
      </div>

      {/* Big progress card */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-8">
        <h2 className="text-2xl font-bold text-white">Apartamento</h2>
        <p className="mt-2 text-slate-400">
          Valor total: {formatCOP(apartamento.valorTotal)} | Meta ahorro: {formatCOP(apartamento.meta)}
        </p>

        <div className="mt-6">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-purple-400">
              {percent.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500">
              {formatCOP(apartamento.totalAportado)} / {formatCOP(apartamento.valorTotal)}
            </span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-500">Faltante</p>
            <p className="mt-1 text-xl font-bold text-amber-400">
              {formatCOP(faltante)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-500">Si envías $20M/mes</p>
            <p className="mt-1 text-xl font-bold text-slate-300">
              {Math.ceil(faltante / 20000000)} meses
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-500">Si envías $10M/mes</p>
            <p className="mt-1 text-xl font-bold text-slate-300">
              {Math.ceil(faltante / 10000000)} meses
            </p>
          </div>
        </div>

        {/* Aportes mensuales */}
        {apartamento.aportesMensuales.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Historial de Aportes</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-400">Mes</th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-400">Aporte</th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-400">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {apartamento.aportesMensuales.map((a, i) => (
                    <tr key={i} className="border-b border-slate-800">
                      <td className="px-4 py-2 capitalize text-slate-300">{a.mes}</td>
                      <td className="px-4 py-2 text-right text-emerald-400">
                        {a.valor > 0 ? formatCOP(a.valor) : "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-300">{formatCOP(a.acumulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
