"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";

interface Props {
  transactions: Transaction[];
  currency: "CLP" | "COP";
  pageSize?: number;
}

const categoryVariant: Record<string, string> = {
  ingreso: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  gasto: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  préstamo: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  prestamo: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  inversión: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  inversion: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function TransactionTable({
  transactions,
  currency,
  pageSize = 15,
}: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const handleCategoryChange = (value: string | null) =>
    setCategoryFilter(value ?? "all");

  const format = currency === "CLP" ? formatCLP : formatCOP;

  const categories = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.categoria.toLowerCase()))).filter(
        Boolean
      ),
    [transactions]
  );

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesText =
          t.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          t.fecha.includes(search);
        const matchesCategory =
          categoryFilter === "all" ||
          t.categoria.toLowerCase() === categoryFilter;
        return matchesText && matchesCategory;
      }),
    [transactions, search, categoryFilter]
  );

  const { page, totalPages, paginated, goTo } = usePagination(filtered, pageSize);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar descripción o fecha..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            goTo(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            handleCategoryChange(v);
            goTo(1);
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Ingreso</TableHead>
              <TableHead className="text-right">Gasto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  No se encontraron transacciones
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {t.fecha}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        categoryVariant[t.categoria.toLowerCase()] ??
                          "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {t.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.descripcion}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-400">
                    {t.ingreso > 0 ? format(t.ingreso) : ""}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-rose-400">
                    {t.gasto > 0 ? format(t.gasto) : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPage={goTo}
        totalItems={filtered.length}
        pageSize={pageSize}
      />
    </div>
  );
}
