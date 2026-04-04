import { FiGlobe, FiTrendingUp, FiTrendingDown, FiPieChart } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import TransactionTable from "@/components/TransactionTable";
import { getCajaColombia } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 300;

export default async function CajaColombiaPage() {
  const { transactions, investmentSummary, remesaDetalle } = await getCajaColombia();

  const totalIngresos = transactions.reduce((s, t) => s + t.ingreso, 0);
  const totalGastos = transactions.reduce((s, t) => s + t.gasto, 0);
  const saldo = totalIngresos - totalGastos;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Caja Colombia</h1>
        <p className="text-muted-foreground text-sm mt-1">Ingresos y gastos en pesos colombianos</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Ingresos"
          value={formatCOP(totalIngresos)}
          icon={<FiTrendingUp size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Total Gastos"
          value={formatCOP(totalGastos)}
          icon={<FiTrendingDown size={20} />}
          color="rose"
        />
        <DashboardCard
          title="Saldo"
          value={formatCOP(saldo)}
          icon={<FiGlobe size={20} />}
          color={saldo >= 0 ? "blue" : "rose"}
        />
        <DashboardCard
          title="Inversión Busetas"
          value={formatCOP(investmentSummary.totalInvertido)}
          subtitle={`Recuperado ${investmentSummary.porcentajeRecuperacion.toFixed(2)}%`}
          icon={<FiPieChart size={20} />}
          color="indigo"
        />
      </div>

      {remesaDetalle.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalle Remesa Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {remesaDetalle.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.motivo}</span>
                  <span className="font-mono font-medium">{formatCOP(r.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Transacciones</h2>
        <TransactionTable transactions={transactions} currency="COP" />
      </div>
    </div>
  );
}
