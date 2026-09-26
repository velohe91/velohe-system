/**
 * Non-EVM injected wallet helpers (Solana / Tezos).
 * Do NOT add these chains to wagmi — EVM stays in config.ts.
 */

import { TempleWallet } from "@temple-wallet/dapp";

export type ChainNamespace = "evm" | "solana" | "tezos";

export type SolanaWalletKind = "phantom" | "solflare" | "injected";

export type LinkedSession = {
  namespace: "solana" | "tezos";
  address: string;
  walletName: string;
  balance: number | null;
  symbol: "SOL" | "XTZ";
};

type SolanaProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString(): string } | null;
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
};

type TezosProvider = {
  requestPermissions: (opts?: {
    network?: { type: string };
  }) => Promise<unknown>;
  getPKH: () => Promise<string>;
  getBalance?: (address: string) => Promise<string | number>;
  clearActiveAccount?: () => Promise<void>;
  removeAllAccounts?: () => Promise<void>;
};

declare global {
  interface Window {
    solana?: SolanaProvider;
    solflare?: SolanaProvider;
    tezos?: TezosProvider;
    temple?: unknown;
    beacon?: unknown;
  }
}

/** Active TempleWallet instance for disconnect */
let templeWallet: TempleWallet | null = null;

/** Unified copy when the user cancels / rejects any wallet connect prompt */
export const USER_REJECTED = "User rejected the request.";

export function isUserRejection(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as {
    code?: number | string;
    name?: string;
    message?: string;
    shortMessage?: string;
  };
  const code = anyErr.code;
  const name = (anyErr.name ?? "").toLowerCase();
  const msg = `${anyErr.message ?? ""} ${anyErr.shortMessage ?? ""}`.toLowerCase();
  return (
    code === 4001 ||
    code === "4001" ||
    code === "ACTION_REJECTED" ||
    name.includes("userrejected") ||
    name.includes("connectoruserrejected") ||
    /user rejected|rejected the request|request rejected|denied|cancelled|canceled|user closed|closed the modal|user abort/i.test(
      msg,
    )
  );
}

export function walletErrorMessage(err: unknown): string {
  if (isUserRejection(err)) return USER_REJECTED;
  if (err instanceof Error && err.message.trim()) return err.message;
  return "Wallet request failed.";
}

export function truncateAddress(address: string, head = 4, tail = 2): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function getEvmExplorerUrl(chainId: number, address: string): string {
  const map: Record<number, string> = {
    1: `https://etherscan.io/address/${address}`,
    8453: `https://basescan.org/address/${address}`,
    137: `https://polygonscan.com/address/${address}`,
    56: `https://bscscan.com/address/${address}`,
    42161: `https://arbiscan.io/address/${address}`,
    10: `https://optimistic.etherscan.io/address/${address}`,
    43114: `https://snowtrace.io/address/${address}`,
    4663: `https://robinhoodchain.blockscout.com/address/${address}`,
    5042: `https://explorer.arc.io/address/${address}`,
  };
  return map[chainId] ?? `https://etherscan.io/address/${address}`;
}

export function getSolanaExplorerUrl(address: string): string {
  return `https://solscan.io/account/${address}`;
}

export function getTezosExplorerUrl(address: string): string {
  return `https://tzkt.io/${address}`;
}

function getSolanaProvider(): {
  provider: SolanaProvider;
  kind: SolanaWalletKind;
  name: string;
} | null {
  if (typeof window === "undefined") return null;

  if (window.solflare?.isSolflare) {
    return {
      provider: window.solflare,
      kind: "solflare",
      name: "Solflare",
    };
  }
  if (window.solana?.isPhantom) {
    return {
      provider: window.solana,
      kind: "phantom",
      name: "Phantom",
    };
  }
  if (window.solana) {
    return {
      provider: window.solana,
      kind: "injected",
      name: "Solana Wallet",
    };
  }
  return null;
}

export async function fetchSolBalance(address: string): Promise<number | null> {
  try {
    const res = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: { value?: number };
    };
    const lamports = json.result?.value;
    return typeof lamports === "number" ? lamports / 1e9 : null;
  } catch {
    return null;
  }
}

export async function fetchXtzBalance(address: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.tzkt.io/v1/accounts/${encodeURIComponent(address)}/balance`,
    );
    if (!res.ok) return null;
    const mutez = Number(await res.text());
    return Number.isFinite(mutez) ? mutez / 1e6 : null;
  } catch {
    return null;
  }
}

export async function connectSolanaNode(): Promise<LinkedSession> {
  const detected = getSolanaProvider();
  if (!detected) {
    if (typeof window !== "undefined") {
      window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
    }
    throw new Error(
      "No Solana wallet detected. Install Phantom or Solflare, then retry.",
    );
  }

  const { provider, name } = detected;
  const result = await provider.connect();
  const address =
    result.publicKey?.toString() ?? provider.publicKey?.toString() ?? "";
  if (!address) {
    throw new Error("Solana connect succeeded but no public key was returned.");
  }

  const balance = await fetchSolBalance(address);
  return {
    namespace: "solana",
    address,
    walletName: name,
    balance,
    symbol: "SOL",
  };
}

export async function disconnectSolanaNode(): Promise<void> {
  const detected = getSolanaProvider();
  if (!detected) return;
  try {
    await detected.provider.disconnect();
  } catch {
    // ignore
  }
}

function waitForWindowLoad(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/** Temple 2.x may inject late and often does not set window.tezos */
async function detectTempleAvailable(waitMs = 1200): Promise<boolean> {
  await waitForWindowLoad();

  if (await TempleWallet.isAvailable()) return true;

  // Fallbacks for alternate injections
  if (typeof window !== "undefined") {
    if (window.tezos || window.temple || window.beacon) return true;
  }

  // Wait for late script injection / unlock
  const late = await new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const unsub =
      typeof TempleWallet.onAvailabilityChange === "function"
        ? TempleWallet.onAvailabilityChange((available) => {
            if (available) finish(true);
          })
        : null;

    window.setTimeout(async () => {
      if (await TempleWallet.isAvailable()) {
        finish(true);
        return;
      }
      if (window.tezos || window.temple || window.beacon) {
        finish(true);
        return;
      }
      finish(false);
      if (typeof unsub === "function") unsub();
    }, waitMs);
  });

  return late;
}

export async function connectTezosNode(): Promise<LinkedSession> {
  if (typeof window === "undefined") {
    throw new Error("Tezos connect is only available in the browser.");
  }

  const available = await detectTempleAvailable(1200);

  if (!available) {
    // Do NOT auto-open the store. Rejects are handled via isUserRejection upstream.
    throw new Error("Temple not detected. Unlock the extension and retry.");
  }

  const wallet = new TempleWallet("VΣLOHE SYSTEM");
  await wallet.connect("mainnet");
  templeWallet = wallet;

  let address = "";
  try {
    // Preferred path via Taquito wallet API
    const tezos = wallet.toTezos();
    address = await tezos.wallet.pkh();
  } catch {
    // Fallback if toTezos is unavailable in this build
    const maybePkh = (
      wallet as unknown as { getPKH?: () => Promise<string> }
    ).getPKH;
    if (maybePkh) address = await maybePkh.call(wallet);
  }

  if (!address && window.tezos?.getPKH) {
    address = await window.tezos.getPKH();
  }

  if (!address) {
    throw new Error("Temple connected but no Tezos address was returned.");
  }

  const balance = await fetchXtzBalance(address);
  return {
    namespace: "tezos",
    address,
    walletName: "Temple",
    balance,
    symbol: "XTZ",
  };
}

export async function disconnectTezosNode(): Promise<void> {
  try {
    if (templeWallet) {
      // TempleWallet has no universal disconnect; clear local handle.
      templeWallet = null;
    }
    if (typeof window !== "undefined" && window.tezos) {
      if (window.tezos.clearActiveAccount) {
        await window.tezos.clearActiveAccount();
      } else if (window.tezos.removeAllAccounts) {
        await window.tezos.removeAllAccounts();
      }
    }
  } catch {
    // ignore
  }
}

export function formatNativeBalance(
  balance: number | null,
  symbol: string,
  digits = 4,
): string {
  if (balance === null || Number.isNaN(balance)) return `--- ${symbol}`;
  return `${balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })} ${symbol}`;
}
