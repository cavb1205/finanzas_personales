"use client";

import { useEffect, useState } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import DashboardCard from "@/components/DashboardCard";
import { formatUSD, formatPercent } from "@/lib/format";

interface AssetData {
  invertido: number;
  cantidad: number;
  nombre: string;
}

interface Props {
  byEtf: Record<string, AssetData>;
  inversionTotal: number;
}

interface Prices {
  GOOG?: number;
  BTC?: number;
}

export default function PortafolioDashboardCard({ byEtf, inversionTotal }: Props) {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      try {
        const res = await fetch("/api/prices");
        if (res.ok) setPrices(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const etfs = Object.entries(byEtf);

  const valorActual = prices
    ? etfs.reduce((s, [etf, data]) => {
        const livePrice = prices[etf as keyof Prices];
        return s + (livePrice !== undefined ? livePrice * data.cantidad : data.invertido);
      }, 0)
    : null;

  const ganancia = valorActual !== null ? valorActual - inversionTotal : null;
  const gananciaPercent =
    ganancia !== null && inversionTotal > 0 ? (ganancia / inversionTotal) * 100 : null;

  const isPositive = ganancia === null || ganancia >= 0;

  const displayValue = valorActual !== null ? formatUSD(valorActual) : (loading ? "…" : formatUSD(inversionTotal));
  const subtitleText =
    ganancia !== null && gananciaPercent !== null
      ? `Invertido ${formatUSD(inversionTotal)} · ${formatPercent(gananciaPercent)}`
      : `Invertido ${formatUSD(inversionTotal)}${loading ? " · cargando…" : ""}`;

  return (
    <DashboardCard
      title="Portafolio"
      value={displayValue}
      subtitle={subtitleText}
      tooltip="Valor de mercado actual del portafolio de inversiones (GOOG + BTC) en dólares — precio live"
      icon={isPositive ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
      color={isPositive ? "indigo" : "rose"}
    />
  );
}
