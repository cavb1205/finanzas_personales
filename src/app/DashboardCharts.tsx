"use client";

import MonthlyChart from "@/components/MonthlyChart";
import TasaAhorroChart from "./TasaAhorroChart";
import type { MonthlySummary } from "@/lib/sheets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  summary: MonthlySummary[];
}

export default function DashboardCharts({ summary }: Props) {
  return (
    <Tabs defaultValue="mensual">
      <TabsList>
        <TabsTrigger value="mensual">Ingresos vs Gastos</TabsTrigger>
        <TabsTrigger value="ahorro">Tasa de Ahorro</TabsTrigger>
      </TabsList>
      <TabsContent value="mensual" className="mt-4">
        <MonthlyChart data={summary} title="Caja Chile - Ingresos vs Gastos por Mes" />
      </TabsContent>
      <TabsContent value="ahorro" className="mt-4">
        <TasaAhorroChart summary={summary} />
      </TabsContent>
    </Tabs>
  );
}
