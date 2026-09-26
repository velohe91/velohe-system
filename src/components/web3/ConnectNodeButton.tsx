"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMultiChain } from "@/components/web3/MultiChainProvider";
import { ChainConnectModal } from "@/components/web3/ChainConnectModal";
import { NodeAccountModal } from "@/components/web3/NodeAccountModal";
import { NetworkSwitchModal } from "@/components/web3/NetworkSwitchModal";
import { getChainBadgeLabel, PRIMARY_CHAIN } from "@/lib/web3/config";
import { truncateAddress } from "@/lib/web3/multi-chain";

/**
 * CONNECT NODE — multi-namespace entry.
 * EVM via RainbowKit; Solana/Tezos via injected helpers.
 * Custom NetworkSwitchModal replaces RainbowKit openChainModal.
 * Custom NodeAccountModal replaces RainbowKit openAccountModal.
 */
export function ConnectNodeButton() {
  const { solana, tezos, hasAnyAltChain, focusedNamespace } = useMultiChain();
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted;
        const evmConnected = Boolean(ready && account && chain);
        const anyConnected = evmConnected || hasAnyAltChain;

        const displayAddress =
          focusedNamespace === "solana" && solana
            ? solana.address
            : focusedNamespace === "tezos" && tezos
              ? tezos.address
              : evmConnected
                ? account!.address
                : solana?.address ?? tezos?.address ?? null;

        const networkBadgeLabel =
          focusedNamespace === "solana" && solana
            ? "SOLANA"
            : focusedNamespace === "tezos" && tezos
              ? "TEZOS"
              : chain && !chain.unsupported
                ? getChainBadgeLabel(chain.id, chain.name)
                : hasAnyAltChain && solana
                  ? "SOLANA"
                  : hasAnyAltChain && tezos
                    ? "TEZOS"
                    : chain
                      ? getChainBadgeLabel(chain.id, chain.name)
                      : "NETWORK";

        if (!ready) {
          return (
            <button
              type="button"
              disabled
              className="rounded border border-neon-cyan/20 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted opacity-50"
            >
              …
            </button>
          );
        }

        return (
          <>
            {!anyConnected ? (
              <button
                type="button"
                onClick={() => setChainModalOpen(true)}
                className="rounded border border-neon-cyan/50 bg-neon-cyan/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon-cyan transition-colors hover:border-neon-cyan hover:bg-neon-cyan/20"
              >
                Connect Node
              </button>
            ) : chain?.unsupported && evmConnected ? (
              <button
                type="button"
                onClick={() => setNetworkModalOpen(true)}
                className="rounded border border-amber-400/50 bg-amber-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-500/20"
                title={`Switch to ${PRIMARY_CHAIN.name}`}
              >
                Switch Network
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNetworkModalOpen(true)}
                  className="hidden rounded border border-neon-blue/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neon-blue sm:inline-flex"
                  title="Switch network"
                >
                  {networkBadgeLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(true)}
                  className="rounded border border-neon-cyan/40 bg-neon-cyan/5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neon-cyan transition-colors hover:border-neon-cyan hover:bg-neon-cyan/10"
                  title={displayAddress ?? "Node account"}
                >
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  {displayAddress
                    ? truncateAddress(displayAddress)
                    : "Node"}
                </button>
              </div>
            )}

            <ChainConnectModal
              open={chainModalOpen}
              onClose={() => setChainModalOpen(false)}
              onOpenEvm={openConnectModal}
            />
            <NetworkSwitchModal
              open={networkModalOpen}
              onClose={() => setNetworkModalOpen(false)}
              onNetworkChanged={() => setAccountModalOpen(true)}
            />
            <NodeAccountModal
              open={accountModalOpen}
              onClose={() => setAccountModalOpen(false)}
              onLinkAnother={() => setChainModalOpen(true)}
              onSwitchNetwork={() => setNetworkModalOpen(true)}
            />
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
