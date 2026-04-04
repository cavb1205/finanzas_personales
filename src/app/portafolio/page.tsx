import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPortafolio } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";
import PortafolioTable from "./PortafolioTable";

export const revalidate = 300;

export default async function PortafolioPage() {
  const { entries, resumen } = await getPortafolio();

  // Group by ETF
  const byEtf = new Map<
    string,
    { invertido: number; actual: number; ganancia: number }
  >();
  for (const e of entries) {
    const key = e.etf;
    const existing = byEtf.get(key) || {
      invertido: 0,
      actual: 0,
      ganancia: 0,
    };
    existing.invertido += e.inversionInicial;
    existing.actual += e.valorActual;
    existing.ganancia += e.ganancia;
    byEtf.set(key, existing);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Portafolio de Inversiones</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Invertido"
          value={formatUSD(resumen.inversionTotal)}
          icon={<FiDollarSign size={24} />}
          color="blue"
        />
        <DashboardCard
          title="Valor Actual"
          value={formatUSD(resumen.valorActual)}
          icon={<FiTrendingUp size={24} />}
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Ganancia/Pérdida"
          value={`${formatUSD(resumen.ganancia)} (${formatPercent(resumen.gananciaPercent)})`}
          icon={
            resumen.ganancia >= 0 ? (
              <FiTrendingUp size={24} />
            ) : (
              <FiTrendingDown size={24} />
            )
          }
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">
        Resumen por Activo
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {Array.from(byEtf.entries()).map(([etf, data]) => {
          const pct =
            data.invertido > 0 ? (data.ganancia / data.invertido) * 100 : 0;
          return (
            <div
              key={etf}
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{etf}</h3>
                <span
                  className={`text-sm font-medium ${pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {formatPercent(pct)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Invertido</p>
                  <p className="text-slate-300">{formatUSD(data.invertido)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Actual</p>
                  <p className="text-slate-300">{formatUSD(data.actual)}</p>
                </div>
                <div>
                  <p className="text-slate-500">G/P</p>
                  <p
                    className={
                      data.ganancia >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {formatUSD(data.ganancia)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-white">
        Detalle de Posiciones
      </h2>
      <PortafolioTable entries={entries} />
    </div>
  );
}
