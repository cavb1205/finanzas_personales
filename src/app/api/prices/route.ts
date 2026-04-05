import { NextResponse } from "next/server";

const SYMBOLS: Record<string, string> = {
  GOOG: "GOOG",
  BTC: "BTC-USD",
};

// Route handler revalidate must be a literal — matches REVALIDATE_SECONDS in src/lib/config.ts
export const revalidate = 300;

export async function GET() {
  try {
    const results: Record<string, number> = {};

    await Promise.all(
      Object.entries(SYMBOLS).map(async ([key, symbol]) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 300 },
        });
        if (!res.ok) return;
        const json = await res.json();
        const price =
          json?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
        if (price !== null) results[key] = price;
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
