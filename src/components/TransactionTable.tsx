"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

interface Props {
  transactions: Transaction[];
  currency: "CLP" | "COP";
  pageSize?: number;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

/** Normalize category for comparison and display: lowercase + strip accents */
function normCat(cat: string): string {
  return cat.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const categoryVariant: Record<string, string> = {
  ingreso:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  gasto:    "bg-rose-500/15 text-rose-400 border-rose-500/20",
  prestamo: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  inversion:"bg-blue-500/15 text-blue-400 border-blue-500/20",
};

/** Returns "yyyy-MM" from any supported date string, or "" */
function toMonthKey(fecha: string): string {
  const sep = fecha.includes("/") ? "/" : "-";
  const parts = fecha.split(sep);
  const currentYear = new Date().getFullYear();
  let mm: string, yyyy: string;
  if (parts.length === 2) {
    [, mm] = parts;
    yyyy = String(currentYear);
  } else if (parts.length === 3) {
    if (parts[0].length === 4) { [yyyy, mm] = parts; }
    else { [, mm, yyyy] = parts; }
  } else {
    return "";
  }
  if (!mm || !yyyy) return "";
  return `${yyyy}-${mm.padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [yyyy, mm] = key.split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

export default function TransactionTable({
  transactions,
  currency,
  pageSize = 15,
  onEdit,
  onDelete,
}: Props) {
  const hasActions = Boolean(onEdit || onDelete);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const format = currency === "CLP" ? formatCLP : formatCOP;

  // Deduplicate categories after normalizing (strips accents + lowercase)
  const categories = useMemo(() => {
    const seen = new Map<string, string>(); // normalized → original display value
    for (const t of transactions) {
      const norm = normCat(t.categoria);
      if (norm && !seen.has(norm)) seen.set(norm, t.categoria.trim());
    }
    return Array.from(seen.entries()); // [normalized, display]
  }, [transactions]);

  // Build sorted list of available months
  const months = useMemo(() => {
    const keys = new Set<string>();
    for (const t of transactions) {
      const k = toMonthKey(t.fecha);
      if (k) keys.add(k);
    }
    return Array.from(keys).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(
    () => transactions.filter((t) => {
      const matchesText =
        t.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        t.fecha.includes(search);
      const matchesCategory =
        categoryFilter === "all" || normCat(t.categoria) === categoryFilter;
      const matchesMonth =
        monthFilter === "all" || toMonthKey(t.fecha) === monthFilter;
      return matchesText && matchesCategory && matchesMonth;
    }),
    [transactions, search, categoryFilter, monthFilter]
  );

  const { page, totalPages, paginated, goTo } = usePagination(filtered, pageSize);

  if (transactions.length === 0) {
    return <EmptyState title="Sin transacciones" description="No se encontraron transacciones en este módulo." />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          placeholder="Buscar descripción o fecha..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); goTo(1); }}
          className="sm:max-w-xs"
        />
        <Select value={monthFilter} onValueChange={(v) => { if (v) { setMonthFilter(v); goTo(1); } }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los meses</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { if (v) { setCategoryFilter(v); goTo(1); } }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map(([norm, display]) => (
              <SelectItem key={norm} value={norm}>
                {display.charAt(0).toUpperCase() + display.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(monthFilter !== "all" || categoryFilter !== "all" || search) && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter("all"); setMonthFilter("all"); goTo(1); }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 self-center"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} transacci{filtered.length === 1 ? "ón" : "ones"}
        {filtered.length !== transactions.length && ` de ${transactions.length}`}
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead className="hidden sm:table-cell">Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Ingreso</TableHead>
              <TableHead className="text-right">Gasto</TableHead>
              {hasActions && <TableHead className="w-8" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={hasActions ? 6 : 5} className="py-0">
                  <EmptyState
                    title="Sin resultados"
                    description="Ninguna transacción coincide con los filtros aplicados."
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {t.fecha}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                      categoryVariant[normCat(t.categoria)] ?? "bg-muted text-muted-foreground border-border"
                    )}>
                      {t.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-[140px] sm:max-w-none truncate">
                    <span className="block truncate">{t.descripcion}</span>
                    {/* Categoría badge visible solo en mobile, bajo la descripción */}
                    <span className={cn(
                      "sm:hidden inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium mt-1",
                      categoryVariant[normCat(t.categoria)] ?? "bg-muted text-muted-foreground border-border"
                    )}>
                      {t.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-400 whitespace-nowrap">
                    {t.ingreso > 0 ? format(t.ingreso) : ""}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-rose-400 whitespace-nowrap">
                    {t.gasto > 0 ? format(t.gasto) : ""}
                  </TableCell>
                  {hasActions && (
                    <TableCell className="p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <FiMoreVertical size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onSelect={() => onEdit(t)}>
                              <FiEdit2 size={13} className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => onDelete(t)}
                            >
                              <FiTrash2 size={13} className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
