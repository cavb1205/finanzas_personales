"use client";

import { useState } from "react";
import type { InvestmentEntry } from "@/lib/sheets";
import { formatUSD, formatPercent } from "@/lib/format";

export default function PortafolioTable({
  entries,
}: {
  entries: InvestmentEntry[];
}) {
  const [filterEtf, setFilterEtf] = useState("all");
  const etfs = Array.from(new Set(entries.map((e) => e.etf)));

  const filtered =
    filterEtf === "all" ? entries : entries.filter((e) => e.etf === filterEtf);

  return (
    <div>
      <div className="mb-4">
        <select
          value={filterEtf}
          onChange={(e) => setFilterEtf(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">Todos los activos</option>
          {etfs.map((etf) => (
            <option key={etf} value={etf}>
              {etf}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Activo
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-slate-400">
                Fecha
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Cantidad
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                P. Compra
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Inversión
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                P. Actual
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                Valor Actual
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
                G/P
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr
                key={i}
                className="border-b border-slate-800 hover:bg-slate-800/30"
              >
                <td className="px-3 py-2 font-medium text-white">{e.etf}</td>
                <td className="px-3 py-2 text-slate-400">{e.fechaCompra}</td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {e.cantidad.toFixed(6)}
                </td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {formatUSD(e.precioCompra)}
                </td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {formatUSD(e.inversionInicial)}
                </td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {formatUSD(e.precioActual)}
                </td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {formatUSD(e.valorActual)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium ${e.ganancia >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {formatUSD(e.ganancia)} ({formatPercent(e.gananciaPercent)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {filtered.length} posiciones
      </p>
    </div>
  );
}
