"use client";

import type { BusetaEntry } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";

export default function BusetasTable({ entries }: { entries: BusetaEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50">
            <th className="px-3 py-3 text-left text-xs font-medium uppercase text-slate-400">
              Fecha
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium uppercase text-slate-400">
              Buseta
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
              Pasajeros
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
              Bruto
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
              ACPM
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
              Gastos
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium uppercase text-slate-400">
              Neto
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr
              key={i}
              className="border-b border-slate-800 hover:bg-slate-800/30"
            >
              <td className="whitespace-nowrap px-3 py-2 text-slate-300">
                {e.fecha}
              </td>
              <td className="px-3 py-2 text-slate-400">{e.buseta}</td>
              <td className="px-3 py-2 text-right text-slate-300">
                {e.pasajeros}
              </td>
              <td className="px-3 py-2 text-right text-slate-300">
                {formatCOP(e.brutoTotal)}
              </td>
              <td className="px-3 py-2 text-right text-rose-400">
                {formatCOP(e.acpm)}
              </td>
              <td className="px-3 py-2 text-right text-rose-400">
                {formatCOP(e.totalGastos)}
              </td>
              <td
                className={`px-3 py-2 text-right font-medium ${e.netoTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {formatCOP(e.netoTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="p-3 text-xs text-slate-500">{entries.length} registros</p>
    </div>
  );
}
