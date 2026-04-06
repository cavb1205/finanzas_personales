"use client";

import { useEffect, useState } from "react";
import { formatUSD, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FiRefreshCw } from "react-icons/fi";

interface AssetData {
  invertido: number;
  cantidad: number; // total shares/coins
  nombre: string;
}

interface Props {
  byEtf: Record<string, AssetData>;
}

interface Prices {
  GOOG?: number;
  BTC?: number;
}

export default function PortafolioAssets({ byEtf }: Props) {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchPrices() {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      if (res.ok) setPrices(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const etfs = Object.entries(byEtf);
  const totalActual = etfs.reduce((s, [etf, data]) => {
    const livePrice = prices?.[etf as keyof Prices];
    return s + (livePrice !== undefined ? livePrice * data.cantidad : data.invertido);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Valores calculados con precio en tiempo real
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading && <FiRefreshCw size={11} className="animate-spin" />}
          {!loading && prices && <span className="text-emerald-400/70">● live</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {etfs.map(([etf, data]) => {
          const livePrice = prices?.[etf as keyof Prices];
          const actual = livePrice !== undefined ? livePrice * data.cantidad : null;
          const ganancia = actual !== null ? actual - data.invertido : null;
          const pct = ganancia !== null && data.invertido > 0 ? (ganancia / data.invertido) * 100 : null;
          const weight = totalActual > 0 && actual !== null ? (actual / totalActual) * 100 : null;
          const progressPct = actual !== null && data.invertido > 0
            ? Math.min((actual / data.invertido) * 100, 200)
            : null;

          const isPositive = pct !== null ? pct >= 0 : true;

          return (
            <Card
              key={etf}
              className={cn("border", isPositive ? "border-emerald-500/20" : "border-rose-500/20")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold">{etf}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-normal">{data.nombre}</span>
                  </div>
                  {pct !== null ? (
                    <span className={cn("text-sm font-mono font-bold", isPositive ? "text-emerald-400" : "text-rose-400")}>
                      {formatPercent(pct)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground animate-pulse">cargando…</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Invertido</p>
                    <p className="font-mono font-medium mt-0.5">{formatUSD(data.invertido)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor actual</p>
                    <p className="font-mono font-medium mt-0.5">
                      {actual !== null ? formatUSD(actual) : <span className="text-muted-foreground">—</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">G / P</p>
                    <p className={cn("font-mono font-medium mt-0.5",
                      ganancia === null ? "text-muted-foreground" : ganancia >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {ganancia !== null ? formatUSD(ganancia) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cuotas</p>
                    <p className="font-mono font-medium mt-0.5">
                      {data.cantidad % 1 === 0
                        ? data.cantidad.toLocaleString()
                        : data.cantidad.toFixed(6).replace(/0+$/, "")}
                    </p>
                  </div>
                </div>

                {progressPct !== null && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Valor vs inversión inicial</span>
                      <span>{progressPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", isPositive ? "bg-emerald-500" : "bg-rose-500")}
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {weight !== null && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Peso en portafolio</span>
                    <span className="font-mono font-medium text-foreground">{weight.toFixed(1)}%</span>
                  </div>
                )}

                {livePrice !== undefined && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                    <span>Precio live</span>
                    <span className="font-mono text-foreground">{formatUSD(livePrice)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
