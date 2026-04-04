import { FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPrestamos } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";

export const revalidate = 300;

export default async function PrestamosPage() {
  const { movimientos, resumen } = await getPrestamos();

  const totalPendiente = resumen.reduce((s, r) => s + r.saldoPendiente, 0);
  const totalPrestado = resumen.reduce((s, r) => s + r.deudaTotal, 0);
  const totalRecuperado = resumen.reduce((s, r) => s + r.totalPagado, 0);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Préstamos</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Prestado"
          value={formatCOP(totalPrestado)}
          icon={<FiUsers size={24} />}
          color="blue"
        />
        <DashboardCard
          title="Total Recuperado"
          value={formatCOP(totalRecuperado)}
          icon={<FiCheckCircle size={24} />}
          color="emerald"
        />
        <DashboardCard
          title="Saldo Pendiente"
          value={formatCOP(totalPendiente)}
          icon={<FiAlertCircle size={24} />}
          color="amber"
        />
      </div>

      {/* Per-person cards */}
      <h2 className="mb-4 text-xl font-semibold text-white">Por Persona</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((p) => {
          const percent =
            p.deudaTotal > 0 ? (p.totalPagado / p.deudaTotal) * 100 : 0;
          return (
            <div
              key={p.persona}
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-4"
            >
              <h3 className="text-lg font-bold text-white">{p.persona}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Deuda</span>
                  <span className="text-slate-300">
                    {formatCOP(p.deudaTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pagado</span>
                  <span className="text-emerald-400">
                    {formatCOP(p.totalPagado)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pendiente</span>
                  <span className="text-amber-400">
                    {formatCOP(p.saldoPendiente)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full ${p.saldoPendiente === 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {percent.toFixed(0)}% pagado
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Movimientos table */}
      <h2 className="mb-4 text-xl font-semibold text-white">Movimientos</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Persona
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Operación
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Observaciones
              </th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr
                key={i}
                className="border-b border-slate-800 hover:bg-slate-800/30"
              >
                <td className="px-4 py-3 text-slate-300">{m.fecha}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {m.persona}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.operacion === "PRÉSTAMO" || m.operacion === "PRESTAMO"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {m.operacion}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatCOP(m.monto)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {m.observaciones}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
