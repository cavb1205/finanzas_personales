"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/sheets";
import { formatCLP, formatCOP } from "@/lib/format";

interface Props {
  transactions: Transaction[];
  currency: "CLP" | "COP";
}

const categoryColors: Record<string, string> = {
  ingreso: "bg-emerald-500/20 text-emerald-300",
  gasto: "bg-rose-500/20 text-rose-300",
  préstamo: "bg-amber-500/20 text-amber-300",
  prestamo: "bg-amber-500/20 text-amber-300",
  inversión: "bg-blue-500/20 text-blue-300",
  inversion: "bg-blue-500/20 text-blue-300",
};

export default function TransactionTable({ transactions, currency }: Props) {
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const format = currency === "CLP" ? formatCLP : formatCOP;

  const categories = Array.from(
    new Set(transactions.map((t) => t.categoria.toLowerCase()))
  ).filter(Boolean);

  const filtered = transactions.filter((t) => {
    const matchesText = t.descripcion
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      t.categoria.toLowerCase() === categoryFilter;
    return matchesText && matchesCategory;
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar descripción..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Descripción
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Ingreso
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Gasto
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr
                key={i}
                className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                  {t.fecha}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      categoryColors[t.categoria.toLowerCase()] ||
                      "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {t.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{t.descripcion}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-emerald-400">
                  {t.ingreso > 0 ? format(t.ingreso) : ""}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-rose-400">
                  {t.gasto > 0 ? format(t.gasto) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-slate-500">
            No se encontraron transacciones
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {filtered.length} de {transactions.length} transacciones
      </p>
    </div>
  );
}
