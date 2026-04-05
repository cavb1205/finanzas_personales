import { NextResponse } from "next/server";

const SYMBOLS: Record<string, string> = {
  GOOG: "GOOG",
  BTC: "BTC-USD",
};

const RANGES: Record<string, { interval: string; range: string }> = {
  "30d":  { interval: "1d",  range: "1mo" },
  "90d":  { interval: "1d",  range: "3mo" },
  "365d": { interval: "1wk", range: "1y"  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "GOOG";
  const period = searchParams.get("period") ?? "30d";

  const symbol = SYMBOLS[ticker];
  if (!symbol) return NextResponse.json({ error: "Unknown ticker" }, { status: 400 });

  const { interval, range } = RANGES[period] ?? RANGES["30d"];

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 }, // cache 1h for history
    });

    if (!res.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 502 });

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return NextResponse.json({ points: [] });

    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];

    const points = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        price: closes[i] ?? null,
      }))
      .filter((p) => p.price !== null);

    return NextResponse.json({ points, currency: ticker === "BTC" ? "USD" : "USD" });
  } catch {
    return NextResponse.json({ points: [] }, { status: 500 });
  }
}
