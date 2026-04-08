import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPortafolio } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortafolioCrud from "./PortafolioCrud";
import PortafolioCharts from "./PortafolioCharts";
import PortafolioAssets from "./PortafolioAssets";
import PriceHistoryChart from "./PriceHistoryChart";

export const revalidate = 300;

export default async function PortafolioPage() {
  const { entries, resumen } = await getPortafolio();

  // byEtf for PortafolioAssets (client component with live prices)
  const byEtfAssets: Record<string, { invertido: number; cantidad: number; nombre: string }> = {};
  for (const e of entries) {
    if (!byEtfAssets[e.etf]) byEtfAssets[e.etf] = { invertido: 0, cantidad: 0, nombre: e.nombre };
    byEtfAssets[e.etf].invertido += e.inversionInicial;
    byEtfAssets[e.etf].cantidad += e.cantidad;
  }

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

      <PortafolioAssets byEtf={byEtfAssets} />

      <Tabs defaultValue="graficos">
        <TabsList>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
        </TabsList>
        <TabsContent value="graficos" className="mt-6 space-y-8">
          <PortafolioCharts entries={entries} />
          <PriceHistoryChart />
        </TabsContent>
        <TabsContent value="posiciones" className="mt-6">
          <PortafolioCrud entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
