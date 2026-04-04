import { FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { getPrestamos } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export default async function PrestamosPage() {
  const { movimientos, resumen } = await getPrestamos();

  const totalPendiente = resumen.reduce((s, r) => s + r.saldoPendiente, 0);
  const totalPrestado = resumen.reduce((s, r) => s + r.deudaTotal, 0);
  const totalRecuperado = resumen.reduce((s, r) => s + r.totalPagado, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Préstamos</h1>
        <p className="text-muted-foreground text-sm mt-1">Control de dinero prestado y abonos</p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Total Prestado"
          value={formatCOP(totalPrestado)}
          icon={<FiUsers size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Recuperado"
          value={formatCOP(totalRecuperado)}
          icon={<FiCheckCircle size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Pendiente"
          value={formatCOP(totalPendiente)}
          icon={<FiAlertCircle size={20} />}
          color="amber"
        />
      </div>

      {/* Per-person progress cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((p) => {
          const percent = p.deudaTotal > 0 ? (p.totalPagado / p.deudaTotal) * 100 : 0;
          const saldado = p.saldoPendiente === 0;
          return (
            <Card key={p.persona}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{p.persona}</p>
                  {saldado ? (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                      Saldado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                      Activo
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deuda</span>
                    <span className="font-mono text-xs">{formatCOP(p.deudaTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagado</span>
                    <span className="font-mono text-xs text-emerald-400">{formatCOP(p.totalPagado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pendiente</span>
                    <span className="font-mono text-xs text-amber-400">{formatCOP(p.saldoPendiente)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        saldado ? "bg-emerald-500" : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{percent.toFixed(0)}% pagado</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Movimientos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Historial</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{m.fecha}</TableCell>
                  <TableCell className="font-medium text-sm">{m.persona}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        m.operacion.includes("PRÉSTAMO") || m.operacion.includes("PRESTAMO")
                          ? "border-rose-500/30 text-rose-400"
                          : "border-emerald-500/30 text-emerald-400"
                      )}
                    >
                      {m.operacion}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCOP(m.monto)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.observaciones}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
