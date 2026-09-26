import { NextResponse } from "next/server";
import type { MarketCoinQuote, MarketPricesResponse } from "@/lib/types";

/** In-memory cache (~45s) to reduce upstream rate limits */
let cache: { at: number; body: MarketPricesResponse } | null = null;
const CACHE_MS = 45_000;
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=45, stale-while-revalidate=30" };

type CoinGeckoMarket = {
  id?: string; symbol?: string; name?: string; image?: string;
  current_price?: number | null; market_cap_rank?: number | null;
};

function toCoin(row: CoinGeckoMarket, index: number): MarketCoinQuote {
  const usd = typeof row.current_price === "number" && Number.isFinite(row.current_price)
    ? row.current_price : null;
  const rank = typeof row.market_cap_rank === "number" && row.market_cap_rank > 0
    ? row.market_cap_rank : index + 1;
  return {
    id: row.id ?? `coin-${index}`,
    symbol: (row.symbol ?? "").toUpperCase(),
    name: row.name ?? "",
    image: row.image ?? null,
    usd,
    marketCapRank: rank,
  };
}

async function fetchTopMarkets(): Promise<MarketCoinQuote[] | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
      { next: { revalidate: 45 }, headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as CoinGeckoMarket[];
    if (!Array.isArray(raw)) return null;
    const coins = raw.slice(0, 20).map(toCoin);
    coins.sort((a, b) => a.marketCapRank - b.marketCapRank);
    return coins;
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return NextResponse.json(cache.body, { headers: CACHE_HEADERS });
  }
  const coins = await fetchTopMarkets();
  if (!coins) {
    if (cache) return NextResponse.json(cache.body, { headers: CACHE_HEADERS });
    return NextResponse.json(
      { updatedAt: new Date().toISOString(), coins: [] } satisfies MarketPricesResponse,
      { status: 502, headers: CACHE_HEADERS },
    );
  }
  const body: MarketPricesResponse = { updatedAt: new Date().toISOString(), coins };
  cache = { at: now, body };
  return NextResponse.json(body, { headers: CACHE_HEADERS });
}
