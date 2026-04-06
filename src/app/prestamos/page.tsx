import { FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import PrestamosDetalle from "./PrestamosDetalle";
import HistorialPrestamos from "./HistorialPrestamos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrestamos } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          tooltip="Suma de todos los préstamos otorgados"
          icon={<FiUsers size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Total Recuperado"
          value={formatCOP(totalRecuperado)}
          tooltip="Suma de todos los abonos y pagos recibidos"
          icon={<FiCheckCircle size={20} />}
          color="emerald"
        />
        <DashboardCard
          title="Pendiente"
          value={formatCOP(totalPendiente)}
          tooltip="Saldo total aún por cobrar de todas las personas"
          icon={<FiAlertCircle size={20} />}
          color="amber"
        />
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="detalle">Timeline por persona</TabsTrigger>
          <TabsTrigger value="historial">Historial completo</TabsTrigger>
        </TabsList>

        {/* Resumen por persona */}
        <TabsContent value="resumen" className="mt-6">
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
        </TabsContent>

        {/* Timeline por persona */}
        <TabsContent value="detalle" className="mt-6">
          <PrestamosDetalle movimientos={movimientos} resumen={resumen} />
        </TabsContent>

        {/* Historial completo */}
        <TabsContent value="historial" className="mt-6">
          <HistorialPrestamos movimientos={movimientos} resumen={resumen} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
