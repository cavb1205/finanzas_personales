"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatUSD } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = [
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1A",  value: "365d" },
];

const TICKERS = ["GOOG", "BTC"];

interface Point { date: string; price: number }

export default function PriceHistoryChart() {
  const [ticker, setTicker] = useState("GOOG");
  const [period, setPeriod] = useState("30d");
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/price-history?ticker=${ticker}&period=${period}`)
      .then((r) => r.json())
      .then((data) => setPoints(data.points ?? []))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [ticker, period]);

  const isUp =
    points.length >= 2
      ? points[points.length - 1].price >= points[0].price
      : true;

  const color = isUp ? "rgba(16, 185, 129," : "rgba(244, 63, 94,";

  const chartData = {
    labels: points.map((p) => p.date),
    datasets: [
      {
        data: points.map((p) => p.price),
        borderColor: `${color} 1)`,
        backgroundColor: `${color} 0.08)`,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${formatUSD(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
      y: {
        ticks: {
          color: "#64748b",
          callback: (v: unknown) => formatUSD(v as number),
        },
        grid: { color: "rgba(51,65,85,0.3)" },
      },
    },
  };

  const pctChange =
    points.length >= 2
      ? ((points[points.length - 1].price - points[0].price) / points[0].price) * 100
      : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold">Historial de precio</h2>
        <div className="flex items-center gap-2">
          {/* Ticker selector */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => setTicker(t)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  ticker === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Period selector */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  period === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price + delta */}
      {!loading && points.length > 0 && (
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold font-mono">
            {formatUSD(points[points.length - 1].price)}
          </span>
          {pctChange !== null && (
            <span className={`text-sm font-mono font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%
            </span>
          )}
          <span className="text-xs text-muted-foreground">{ticker}</span>
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : points.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground rounded-xl border border-border">
          No hay datos disponibles
        </div>
      ) : (
        <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
