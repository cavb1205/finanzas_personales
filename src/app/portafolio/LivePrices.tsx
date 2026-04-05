"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { formatUSD, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InvestmentEntry } from "@/lib/sheets";

interface Props {
  entries: InvestmentEntry[];
}

interface Prices {
  GOOG?: number;
  BTC?: number;
}

export default function LivePrices({ entries }: Props) {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function fetchPrices() {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(id);
  }, []);

  if (!prices && loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <FiRefreshCw size={12} className="animate-spin" />
        Obteniendo precios...
      </div>
    );
  }

  if (!prices || Object.keys(prices).length === 0) return null;

  // Aggregate cost basis per ticker from entries
  const byTicker = new Map<string, { cantidad: number; costoTotal: number }>();
  for (const e of entries) {
    const prev = byTicker.get(e.etf) ?? { cantidad: 0, costoTotal: 0 };
    prev.cantidad += e.cantidad;
    prev.costoTotal += e.inversionInicial;
    byTicker.set(e.etf, prev);
  }

  const rows = Object.entries(prices).map(([ticker, livePrice]) => {
    const data = byTicker.get(ticker);
    const valorActual = data ? livePrice * data.cantidad : null;
    const ganancia = data && valorActual !== null ? valorActual - data.costoTotal : null;
    const pct =
      data && ganancia !== null && data.costoTotal > 0
        ? (ganancia / data.costoTotal) * 100
        : null;

    return { ticker, livePrice, valorActual, ganancia, pct };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Precios en tiempo real</h2>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ ticker, livePrice, valorActual, ganancia, pct }) => (
          <div
            key={ticker}
            className={cn(
              "rounded-xl border p-4 space-y-3",
              pct !== null && pct >= 0
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-rose-500/20 bg-rose-500/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">{ticker}</span>
              <span className="font-mono text-lg font-bold">
                {formatUSD(livePrice)}
              </span>
            </div>

            {valorActual !== null && ganancia !== null && pct !== null && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Valor actual</p>
                  <p className="font-mono font-semibold mt-0.5">
                    {formatUSD(valorActual)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">G / P</p>
                  <p
                    className={cn(
                      "font-mono font-semibold mt-0.5",
                      ganancia >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatUSD(ganancia)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rendimiento</p>
                  <p
                    className={cn(
                      "font-mono font-semibold mt-0.5",
                      pct >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatPercent(pct)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
