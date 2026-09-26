"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useMultiChain } from "@/components/web3/MultiChainProvider";
import {
  formatNativeBalance,
  getEvmExplorerUrl,
  getSolanaExplorerUrl,
  getTezosExplorerUrl,
  truncateAddress,
} from "@/lib/web3/multi-chain";
import { getChainBadgeLabel } from "@/lib/web3/config";

type Props = {
  open: boolean;
  onClose: () => void;
  onLinkAnother: () => void;
  onSwitchNetwork: () => void;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

/**
 * Custom VΣLOHE account panel — replaces RainbowKit openAccountModal.
 * Portaled to document.body so navbar backdrop-filter cannot clip it.
 */
export function NodeAccountModal({
  open,
  onClose,
  onLinkAnother,
  onSwitchNetwork,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const { address, chain, isConnected } = useAccount();
  const { data: evmBalance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });
  const { disconnect } = useDisconnect();
  const { solana, tezos, disconnectSolana, disconnectTezos } = useMultiChain();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const markCopied = (id: string) => {
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        className="absolute inset-0 bg-void/85 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-account-title"
        className="panel box-glow relative z-10 my-auto w-full max-w-lg max-h-[min(88dvh,640px)] overflow-y-auto rounded-lg border border-neon-cyan/30 p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-cyan/70">
          Node // Linked Identities
        </p>
        <h2
          id="node-account-title"
          className="mt-2 font-sans text-lg font-semibold tracking-wide text-neon-cyan"
        >
          Account
        </h2>

        <div className="mt-5 space-y-3">
          {isConnected && address && (
            <article className="rounded border border-neon-cyan/25 bg-black/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
                    EVM
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {chain
                      ? getChainBadgeLabel(chain.id, chain.name)
                      : "UNKNOWN"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground">
                    {truncateAddress(address, 6, 4)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-neon-cyan/80">
                    {evmBalance
                      ? formatNativeBalance(
                          Number(evmBalance.formatted),
                          evmBalance.symbol,
                        )
                      : `--- ${chain?.nativeCurrency.symbol ?? "ETH"}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-neon-cyan/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10"
                  onClick={async () => {
                    await copyText(address);
                    markCopied("evm");
                  }}
                >
                  {copied === "evm" ? "Copied" : "Copy"}
                </button>
                <a
                  href={getEvmExplorerUrl(chain?.id ?? 1, address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-neon-blue/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-blue hover:bg-neon-blue/10"
                >
                  Explorer
                </a>
                <button
                  type="button"
                  className="rounded border border-rose-400/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-rose-300 hover:bg-rose-500/10"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </button>
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded border border-neon-blue/30 px-2 py-1.5 font-mono text-[9px] uppercase tracking-widest text-neon-blue hover:bg-neon-blue/10"
                onClick={() => {
                  onClose();
                  onSwitchNetwork();
                }}
              >
                Switch Network
              </button>
            </article>
          )}

          {solana && (
            <article className="rounded border border-neon-blue/25 bg-black/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neon-blue">
                Solana
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {solana.walletName}
              </p>
              <p className="mt-1 font-mono text-xs text-foreground">
                {truncateAddress(solana.address, 6, 4)}
              </p>
              <p className="mt-1 font-mono text-[11px] text-neon-blue/80">
                {formatNativeBalance(solana.balance, solana.symbol)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-neon-cyan/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10"
                  onClick={async () => {
                    await copyText(solana.address);
                    markCopied("sol");
                  }}
                >
                  {copied === "sol" ? "Copied" : "Copy"}
                </button>
                <a
                  href={getSolanaExplorerUrl(solana.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-neon-blue/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-blue hover:bg-neon-blue/10"
                >
                  Explorer
                </a>
                <button
                  type="button"
                  className="rounded border border-rose-400/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-rose-300 hover:bg-rose-500/10"
                  onClick={() => void disconnectSolana()}
                >
                  Disconnect
                </button>
              </div>
            </article>
          )}

          {tezos && (
            <article className="rounded border border-violet-400/25 bg-black/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-violet-300">
                Tezos
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {tezos.walletName}
              </p>
              <p className="mt-1 font-mono text-xs text-foreground">
                {truncateAddress(tezos.address, 6, 4)}
              </p>
              <p className="mt-1 font-mono text-[11px] text-violet-300/80">
                {formatNativeBalance(tezos.balance, tezos.symbol)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-neon-cyan/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10"
                  onClick={async () => {
                    await copyText(tezos.address);
                    markCopied("xtz");
                  }}
                >
                  {copied === "xtz" ? "Copied" : "Copy"}
                </button>
                <a
                  href={getTezosExplorerUrl(tezos.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-neon-blue/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-blue hover:bg-neon-blue/10"
                >
                  Explorer
                </a>
                <button
                  type="button"
                  className="rounded border border-rose-400/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-rose-300 hover:bg-rose-500/10"
                  onClick={() => void disconnectTezos()}
                >
                  Disconnect
                </button>
              </div>
            </article>
          )}

          {!isConnected && !solana && !tezos && (
            <p className="font-mono text-[11px] text-muted">
              No namespaces linked.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLinkAnother();
            }}
            className="flex-1 rounded border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/20"
          >
            Link another chain
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-neon-cyan/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted hover:border-neon-cyan/40 hover:text-neon-cyan"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
