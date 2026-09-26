"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketCoinQuote, MarketPricesResponse } from "@/lib/types";

const POLL_MS = 45_000;
const MOBILE_VISIBLE = 2;

function formatUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "---";
  const digits = value < 1 ? 4 : 2;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function chipTone(
  status: "loading" | "ok" | "error",
  value: number | null,
  symbol: string,
): string {
  if (status === "error" || value == null) {
    return "border-neon-blue/20 text-muted";
  }

  const tones: Record<string, string> = {
    BTC: "border-[#f7931a]/60 bg-[#f7931a]/10 text-[#ffb45a] shadow-[0_0_8px_rgba(247,147,26,0.12)]",
    ETH: "border-slate-300/45 bg-slate-200/10 text-slate-100 shadow-[0_0_8px_rgba(226,232,240,0.1)]",
    BNB: "border-[#f3ba2f]/60 bg-[#f3ba2f]/10 text-[#ffe08a] shadow-[0_0_8px_rgba(243,186,47,0.12)]",
    SOL: "border-[#14f1d9]/60 bg-[#14f1d9]/10 text-[#6fffe9] shadow-[0_0_8px_rgba(20,241,217,0.12)]",
    XTZ: "border-[#2f7df6]/60 bg-[#2f7df6]/10 text-[#75a8ff] shadow-[0_0_8px_rgba(47,125,246,0.12)]",
    POL: "border-neon-violet/60 bg-neon-violet/10 text-[#d8a4ff] shadow-[0_0_8px_rgba(168,85,247,0.12)]",
  };

  return tones[symbol] ?? "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan";
}

function CoinChip({ coin, status, className = "" }: {
  coin: MarketCoinQuote;
  status: "loading" | "ok" | "error";
  className?: string;
}) {
  const label = status === "loading" && coin.usd == null ? "…" : formatUsd(coin.usd);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-1.5 py-0.5 sm:px-2 ${chipTone(status, coin.usd, coin.symbol)} ${className}`}
      title={`${coin.name} · market cap rank #${coin.marketCapRank}`}
    >
      {coin.image ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 rounded-full bg-center bg-contain bg-no-repeat sm:h-4 sm:w-4"
          style={{ backgroundImage: `url(${coin.image})` }}
        />
      ) : (
        <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full border border-current/30 sm:h-4 sm:w-4" />
      )}
      <span className="font-semibold">{coin.symbol}</span>
      <span className="hidden text-muted sm:inline">//</span>
      <span>{label}</span>
    </span>
  );
}

/**
 * Top-20 market ticker powered by CoinGecko market-cap ranking.
 * Desktop shows all 20. Mobile keeps the first two visible and exposes
 * the remaining assets through a compact +N dropdown.
 */
export function MarketTicker() {
  const [data, setData] = useState<MarketPricesResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/market/prices", { cache: "no-store" });
        if (!res.ok) throw new Error(`http_${res.status}`);
        const json = (await res.json()) as MarketPricesResponse;
        if (!cancelled) {
          const coins = [...(json.coins ?? [])].sort((a, b) => a.marketCapRank - b.marketCapRank);
          setData({ ...json, coins });
          setStatus(coins.length ? "ok" : "error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };
    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  const coins = data?.coins ?? [];
  const mobilePrimary = useMemo(() => coins.slice(0, MOBILE_VISIBLE), [coins]);
  const overflow = useMemo(() => coins.slice(MOBILE_VISIBLE), [coins]);
  const title = data
    ? `Updated ${data.updatedAt} · Top ${coins.length} by USD market cap · CoinGecko`
    : status === "error" ? "Price feed offline" : "Loading market feed";

  return (
    <div className="relative flex min-w-0 flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider sm:gap-2 sm:text-[10px]" title={title} aria-live="polite">
      {coins.map((coin) => (
        <CoinChip key={coin.id} coin={coin} status={status} className="hidden lg:inline-flex" />
      ))}
      {mobilePrimary.map((coin) => (
        <CoinChip key={`m-${coin.id}`} coin={coin} status={status} className="inline-flex lg:hidden" />
      ))}
      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-neon-cyan/30 bg-void/60 px-1.5 py-0.5 text-neon-cyan/80"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Show ${overflow.length} more prices`}
        >
          +{overflow.length}
        </button>
        {open && (
          <div className="absolute right-0 top-full z-40 mt-1 flex max-h-[60vh] flex-col gap-1 overflow-y-auto rounded border border-neon-cyan/20 bg-void/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            {overflow.map((coin) => (
              <CoinChip key={`o-${coin.id}`} coin={coin} status={status} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
