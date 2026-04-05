"use client";

import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/sheets";

interface Props {
  transactions: Transaction[];
  filename?: string;
}

export default function ExportCsvButton({
  transactions,
  filename = "transacciones",
}: Props) {
  function handleExport() {
    const header = ["Fecha", "Categoría", "Descripción", "Ingreso", "Gasto"];
    const rows = transactions.map((t) => [
      t.fecha,
      t.categoria,
      t.descripcion,
      t.ingreso > 0 ? t.ingreso : "",
      t.gasto > 0 ? t.gasto : "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FiDownload className="mr-2" size={14} />
      Exportar CSV
    </Button>
  );
}
