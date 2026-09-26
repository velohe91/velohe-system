"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount, useConnect } from "wagmi";
import { useMultiChain } from "@/components/web3/MultiChainProvider";
import {
  USER_REJECTED,
  isUserRejection,
  walletErrorMessage,
} from "@/lib/web3/multi-chain";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenEvm: () => void;
};

type RowStatus = "connect" | "linking" | "linked";

function statusLabel(status: RowStatus) {
  if (status === "linking") return "Linking…";
  if (status === "linked") return "Linked";
  return "Connect";
}

/**
 * First-screen chain picker: EVM (RainbowKit) · Solana · Tezos.
 * Portaled to document.body so navbar backdrop-filter cannot clip it.
 * Stays open on wallet reject so the shared error banner can show.
 */
export function ChainConnectModal({ open, onClose, onOpenEvm }: Props) {
  const [mounted, setMounted] = useState(false);
  const awaitedEvm = useRef(false);
  const {
    solana,
    tezos,
    connecting,
    error,
    clearError,
    setWalletError,
    connectSolana,
    connectTezos,
  } = useMultiChain();
  const { error: connectError, reset: resetConnect } = useConnect();
  const { isConnected: evmConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      awaitedEvm.current = false;
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Normalize RainbowKit / wagmi connect failures into the shared banner.
  useEffect(() => {
    if (!open || !awaitedEvm.current || !connectError) return;
    if (isUserRejection(connectError)) {
      setWalletError(USER_REJECTED);
    } else {
      setWalletError(walletErrorMessage(connectError));
    }
  }, [open, connectError, setWalletError]);

  // Successful EVM connect: close picker (reject path keeps it open).
  useEffect(() => {
    if (!open || !awaitedEvm.current) return;
    if (evmConnected) {
      awaitedEvm.current = false;
      clearError();
      resetConnect();
      onClose();
    }
  }, [open, evmConnected, clearError, resetConnect, onClose]);

  if (!mounted || !open) return null;

  const solStatus: RowStatus = solana
    ? "linked"
    : connecting === "solana"
      ? "linking"
      : "connect";
  const tezStatus: RowStatus = tezos
    ? "linked"
    : connecting === "tezos"
      ? "linking"
      : "connect";

  const handleClose = () => {
    awaitedEvm.current = false;
    // Closing the Velohe panel is not a wallet reject — clear banner.
    clearError();
    resetConnect();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        className="absolute inset-0 bg-void/85 backdrop-blur-sm"
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chain-connect-title"
        className="panel box-glow relative z-10 my-auto w-full max-w-md max-h-[min(88dvh,640px)] overflow-y-auto rounded-lg border border-neon-cyan/30 p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-cyan/70">
          Protocol // Multi-Chain
        </p>
        <h2
          id="chain-connect-title"
          className="mt-2 font-sans text-lg font-semibold tracking-wide text-neon-cyan"
        >
          Connect Node
        </h2>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
          Link an EVM, Solana, or Tezos wallet. Site navigation stays open either
          way.
        </p>

        <ul className="mt-5 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => {
                clearError();
                resetConnect();
                awaitedEvm.current = true;
                // Keep this modal open under RainbowKit so reject can show.
                onOpenEvm();
              }}
              className="flex w-full items-center justify-between rounded border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-3 text-left transition-colors hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-neon-cyan">
                  EVM
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  ETH / BASE / POL / BNB / ARB / OP / AVAX / RH / ARC
                </span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/80">
                Connect
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              disabled={solStatus !== "connect"}
              onClick={async () => {
                try {
                  await connectSolana();
                } catch {
                  /* error via context */
                }
              }}
              className="flex w-full items-center justify-between rounded border border-neon-blue/30 bg-neon-blue/5 px-3 py-3 text-left transition-colors hover:border-neon-blue/60 hover:bg-neon-blue/10 disabled:cursor-default disabled:opacity-80"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-neon-blue">
                  Solana
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  Phantom / Solflare
                </span>
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  solStatus === "linked"
                    ? "text-emerald-300"
                    : "text-neon-blue/80"
                }`}
              >
                {statusLabel(solStatus)}
              </span>
            </button>
          </li>

          <li>
            <button
              type="button"
              disabled={tezStatus !== "connect"}
              onClick={async () => {
                try {
                  await connectTezos();
                } catch {
                  /* error via context */
                }
              }}
              className="flex w-full items-center justify-between rounded border border-violet-400/30 bg-violet-500/5 px-3 py-3 text-left transition-colors hover:border-violet-400/60 hover:bg-violet-500/10 disabled:cursor-default disabled:opacity-80"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-violet-300">
                  Tezos
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  Temple
                </span>
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  tezStatus === "linked"
                    ? "text-emerald-300"
                    : "text-violet-300/80"
                }`}
              >
                {statusLabel(tezStatus)}
              </span>
            </button>
          </li>
        </ul>

        {error && (
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-rose-300/90">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-5 w-full rounded border border-neon-cyan/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted hover:border-neon-cyan/40 hover:text-neon-cyan"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
