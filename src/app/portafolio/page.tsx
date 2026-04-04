import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPortafolio } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PortafolioTable from "./PortafolioTable";

export const revalidate = 300;

export default async function PortafolioPage() {
  const { entries, resumen } = await getPortafolio();

  const byEtf = new Map<string, { invertido: number; actual: number; ganancia: number }>();
  for (const e of entries) {
    const prev = byEtf.get(e.etf) ?? { invertido: 0, actual: 0, ganancia: 0 };
    prev.invertido += e.inversionInicial;
    prev.actual += e.valorActual;
    prev.ganancia += e.ganancia;
    byEtf.set(e.etf, prev);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portafolio</h1>
        <p className="text-muted-foreground text-sm mt-1">Inversiones en bolsa y criptomonedas (USD)</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Invertido"
          value={formatUSD(resumen.inversionTotal)}
          icon={<FiDollarSign size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Valor Actual"
          value={formatUSD(resumen.valorActual)}
          icon={<FiTrendingUp size={20} />}
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Ganancia / Pérdida"
          value={`${formatUSD(resumen.ganancia)}`}
          subtitle={formatPercent(resumen.gananciaPercent)}
          icon={resumen.ganancia >= 0 ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
      </div>

      {/* By asset */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from(byEtf.entries()).map(([etf, data]) => {
          const pct = data.invertido > 0 ? (data.ganancia / data.invertido) * 100 : 0;
          return (
            <Card key={etf}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{etf}</span>
                  <span className={cn("text-sm font-mono font-bold", pct >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {formatPercent(pct)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Invertido</p>
                    <p className="font-mono text-sm mt-0.5">{formatUSD(data.invertido)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="font-mono text-sm mt-0.5">{formatUSD(data.actual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">G / P</p>
                    <p className={cn("font-mono text-sm mt-0.5", data.ganancia >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {formatUSD(data.ganancia)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Posiciones</h2>
        <PortafolioTable entries={entries} />
      </div>
    </div>
  );
}
