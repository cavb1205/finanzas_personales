import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPortafolio } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PortafolioTable from "./PortafolioTable";
import PortafolioCharts from "./PortafolioCharts";

export const revalidate = 300;

export default async function PortafolioPage() {
  const { entries, resumen } = await getPortafolio();

  const byEtf = new Map<
    string,
    { invertido: number; actual: number; ganancia: number; pct: number; nombre: string }
  >();
  for (const e of entries) {
    const prev = byEtf.get(e.etf) ?? {
      invertido: 0,
      actual: 0,
      ganancia: 0,
      pct: 0,
      nombre: e.nombre,
    };
    prev.invertido += e.inversionInicial;
    prev.actual += e.valorActual;
    prev.ganancia += e.ganancia;
    byEtf.set(e.etf, prev);
  }
  // Compute pct after aggregation
  for (const [key, data] of byEtf.entries()) {
    data.pct = data.invertido > 0 ? (data.ganancia / data.invertido) * 100 : 0;
    byEtf.set(key, data);
  }

  const totalWeight = resumen.valorActual;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portafolio</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inversiones en bolsa y criptomonedas (USD)
        </p>
      </div>

      <Separator />

      {/* Summary cards */}
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
          subtitle={`${resumen.ganancia >= 0 ? "+" : ""}${formatUSD(resumen.ganancia)} total`}
          icon={<FiTrendingUp size={20} />}
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
        <DashboardCard
          title="Rendimiento"
          value={formatPercent(resumen.gananciaPercent)}
          subtitle={resumen.gananciaPercent >= 0 ? "En positivo" : "En negativo"}
          icon={
            resumen.ganancia >= 0 ? (
              <FiTrendingUp size={20} />
            ) : (
              <FiTrendingDown size={20} />
            )
          }
          color={resumen.ganancia >= 0 ? "emerald" : "rose"}
        />
      </div>

      {/* Per-asset cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from(byEtf.entries()).map(([etf, data]) => {
          const weight =
            totalWeight > 0 ? (data.actual / totalWeight) * 100 : 0;
          const progressPct = Math.min(
            data.invertido > 0 ? (data.actual / data.invertido) * 100 : 0,
            200
          );
          return (
            <Card
              key={etf}
              className={cn(
                "border",
                data.pct >= 0 ? "border-emerald-500/20" : "border-rose-500/20"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold">{etf}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      {data.nombre}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-mono font-bold",
                      data.pct >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatPercent(data.pct)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Invertido</p>
                    <p className="font-mono font-medium mt-0.5">
                      {formatUSD(data.invertido)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor actual</p>
                    <p className="font-mono font-medium mt-0.5">
                      {formatUSD(data.actual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">G / P</p>
                    <p
                      className={cn(
                        "font-mono font-medium mt-0.5",
                        data.ganancia >= 0 ? "text-emerald-400" : "text-rose-400"
                      )}
                    >
                      {formatUSD(data.ganancia)}
                    </p>
                  </div>
                </div>

                {/* Progress bar: actual vs invertido */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Valor vs inversión inicial</span>
                    <span>{progressPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        data.pct >= 0 ? "bg-emerald-500" : "bg-rose-500"
                      )}
                      style={{ width: `${Math.min(progressPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Weight in portfolio */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Peso en portafolio</span>
                  <span className="font-mono font-medium text-foreground">
                    {weight.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="graficos">
        <TabsList>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
        </TabsList>
        <TabsContent value="graficos" className="mt-6">
          <PortafolioCharts entries={entries} />
        </TabsContent>
        <TabsContent value="posiciones" className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Posiciones</h2>
          <PortafolioTable entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
