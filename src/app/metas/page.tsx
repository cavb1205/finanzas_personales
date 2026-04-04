import { FiTarget, FiHome, FiDollarSign } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getApartamento } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const revalidate = 300;

export default async function MetasPage() {
  const apartamento = await getApartamento();
  const percent =
    apartamento.valorTotal > 0
      ? (apartamento.totalAportado / apartamento.valorTotal) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Metas de Ahorro</h1>
        <p className="text-muted-foreground text-sm mt-1">Seguimiento de tu meta para el apartamento</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Valor Apartamento"
          value={formatCOP(apartamento.valorTotal)}
          icon={<FiHome size={20} />}
          color="purple"
        />
        <DashboardCard
          title="Meta Inicial"
          value={formatCOP(apartamento.meta)}
          subtitle="Cuota inicial"
          icon={<FiTarget size={20} />}
          color="indigo"
        />
        <DashboardCard
          title="Aportado"
          value={formatCOP(apartamento.totalAportado)}
          icon={<FiDollarSign size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Saldo Pendiente"
          value={formatCOP(apartamento.saldoPendiente)}
          icon={<FiTarget size={20} />}
          color="amber"
        />
      </div>

      {/* Progress card */}
      <Card>
        <CardHeader>
          <CardTitle>Apartamento</CardTitle>
          <CardDescription>
            Valor total: {formatCOP(apartamento.valorTotal)} · Meta cuota inicial: {formatCOP(apartamento.meta)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <span className="text-4xl font-bold font-mono text-purple-400">
                {percent.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {formatCOP(apartamento.totalAportado)} / {formatCOP(apartamento.valorTotal)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>

          {/* Proyecciones */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Enviando $20M/mes", meses: Math.ceil(apartamento.saldoPendiente / 20000000) },
              { label: "Enviando $15M/mes", meses: Math.ceil(apartamento.saldoPendiente / 15000000) },
              { label: "Enviando $10M/mes", meses: Math.ceil(apartamento.saldoPendiente / 10000000) },
            ].map(({ label, meses }) => (
              <div key={label} className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold font-mono mt-1">{meses} meses</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial */}
      {apartamento.aportesMensuales.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Historial de Aportes</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Aporte</TableHead>
                  <TableHead className="text-right">Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartamento.aportesMensuales.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell className="capitalize font-medium text-sm">{a.mes}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {a.valor > 0 ? (
                        <span className="text-emerald-400">{formatCOP(a.valor)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCOP(a.acumulado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
