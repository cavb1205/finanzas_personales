"use client";

import MonthlyChart from "@/components/MonthlyChart";
import SaldoAcumuladoChart from "@/app/caja-chile/SaldoAcumuladoChart";
import CategoryPieChart from "@/app/caja-chile/CategoryPieChart";
import type { MonthlySummary, Transaction } from "@/lib/sheets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  summary: MonthlySummary[];
  transactions: Transaction[];
}

export default function CajaColombiaCharts({ summary, transactions }: Props) {
  return (
    <Tabs defaultValue="mensual">
      <TabsList>
        <TabsTrigger value="mensual">Mensual</TabsTrigger>
        <TabsTrigger value="acumulado">Acumulado</TabsTrigger>
        <TabsTrigger value="categorias">Categorías</TabsTrigger>
      </TabsList>
      <TabsContent value="mensual" className="mt-4">
        <MonthlyChart data={summary} title="Ingresos vs Gastos por Mes" currency="COP" />
      </TabsContent>
      <TabsContent value="acumulado" className="mt-4">
        <SaldoAcumuladoChart summary={summary} currency="COP" />
      </TabsContent>
      <TabsContent value="categorias" className="mt-4">
        <CategoryPieChart transactions={transactions} />
      </TabsContent>
    </Tabs>
  );
}
