"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount, useSwitchChain } from "wagmi";
import { useMultiChain } from "@/components/web3/MultiChainProvider";
import { SUPPORTED_CHAINS } from "@/lib/web3/config";

type Props = {
  open: boolean;
  onClose: () => void;
  onNetworkChanged?: () => void;
};

const EVM_ROWS = SUPPORTED_CHAINS.map((chain) => ({
  chainId: chain.id,
  label: chain.name === "Robinhood Chain" ? "ROBINHOOD" : chain.name.toUpperCase(),
}));

/**
 * Custom network switcher — EVM via wagmi switchChain; Solana/Tezos via
 * MultiChainProvider (never added to wagmi chains).
 * Portaled to document.body so navbar backdrop-filter cannot clip it.
 */
export function NetworkSwitchModal({
  open,
  onClose,
  onNetworkChanged,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const { chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const {
    solana,
    tezos,
    connecting,
    error,
    clearError,
    connectSolana,
    connectTezos,
    focusedNamespace,
    setFocusedNamespace,
  } = useMultiChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    clearError();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, clearError]);

  if (!mounted || !open) return null;

  const supportedEvmIds = new Set<number>(
    SUPPORTED_CHAINS.map((c) => c.id),
  );
  const activeEvmId =
    focusedNamespace === "evm" &&
    chain &&
    supportedEvmIds.has(chain.id)
      ? chain.id
      : null;
  const solActive = focusedNamespace === "solana" && Boolean(solana);
  const tezActive = focusedNamespace === "tezos" && Boolean(tezos);
  const busy = isPending || connecting !== null;

  const handleEvm = (chainId: number) => {
    clearError();
    setFocusedNamespace("evm");
    if (chain?.id === chainId) {
      onClose();
      return;
    }
    switchChain(
      { chainId },
      {
        onSuccess: () => {
          onClose();
          onNetworkChanged?.();
        },
        onError: () => {
          /* wagmi surfaces; keep modal open */
        },
      },
    );
  };

  const handleSolana = async () => {
    clearError();
    if (solana) {
      setFocusedNamespace("solana");
      onClose();
      return;
    }
    try {
      await connectSolana();
      onClose();
    } catch {
      /* error via context — keep modal open */
    }
  };

  const handleTezos = async () => {
    clearError();
    if (tezos) {
      setFocusedNamespace("tezos");
      onClose();
      return;
    }
    try {
      await connectTezos();
      onClose();
    } catch {
      /* error via context — keep modal open */
    }
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
        aria-labelledby="network-switch-title"
        className="panel box-glow relative z-10 my-auto w-full max-w-md max-h-[min(88dvh,640px)] overflow-y-auto rounded-lg border border-neon-cyan/30 p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-cyan/70">
          Protocol // Multi-Chain
        </p>
        <h2
          id="network-switch-title"
          className="mt-2 font-sans text-lg font-semibold tracking-wide text-neon-cyan"
        >
          Switch Network
        </h2>

        <section className="mt-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted">
            Networks // EVM
          </p>
          <ul className="space-y-2">
            {EVM_ROWS.map((row) => {
              const active = activeEvmId === row.chainId;
              return (
                <li key={row.chainId}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleEvm(row.chainId)}
                    className={`flex w-full items-center justify-between rounded border px-3 py-3 text-left transition-colors disabled:opacity-60 ${
                      active
                        ? "border-neon-cyan/60 bg-neon-cyan/15"
                        : "border-neon-cyan/30 bg-neon-cyan/5 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {active && (
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f0ff]"
                          aria-hidden
                        />
                      )}
                      <span className="font-mono text-[11px] uppercase tracking-widest text-neon-cyan">
                        {row.label}
                      </span>
                    </span>
                    {active && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-neon-cyan/70">
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted">
            Networks // Other
          </p>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSolana()}
                className={`flex w-full items-center justify-between rounded border px-3 py-3 text-left transition-colors disabled:opacity-60 ${
                  solActive
                    ? "border-neon-blue/60 bg-neon-blue/15"
                    : "border-neon-blue/30 bg-neon-blue/5 hover:border-neon-blue/60 hover:bg-neon-blue/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  {solActive && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-neon-blue shadow-[0_0_6px_#00a3ff]"
                      aria-hidden
                    />
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-widest text-neon-blue">
                    Solana
                  </span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neon-blue/70">
                  {connecting === "solana"
                    ? "Linking…"
                    : solActive
                      ? "Active"
                      : solana
                        ? "Linked"
                        : "Connect"}
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleTezos()}
                className={`flex w-full items-center justify-between rounded border px-3 py-3 text-left transition-colors disabled:opacity-60 ${
                  tezActive
                    ? "border-violet-400/60 bg-violet-500/15"
                    : "border-violet-400/30 bg-violet-500/5 hover:border-violet-400/60 hover:bg-violet-500/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tezActive && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_6px_#a78bfa]"
                      aria-hidden
                    />
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-widest text-violet-300">
                    Tezos
                  </span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-violet-300/70">
                  {connecting === "tezos"
                    ? "Linking…"
                    : tezActive
                      ? "Active"
                      : tezos
                        ? "Linked"
                        : "Connect"}
                </span>
              </button>
            </li>
          </ul>
        </section>

        {error && (
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-rose-300/90">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded border border-neon-cyan/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted hover:border-neon-cyan/40 hover:text-neon-cyan"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
