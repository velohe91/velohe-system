import type { NftItem } from "@/lib/types";

const TEZOS_WALLET = "tz1LFQHDFX8VzSA1Vyc6sYQdyNGL1KKmwhse";
const TZKT_API = "https://api.tzkt.io/v1";

type TzktMetadata = {
  name?: string;
  description?: string;
  symbol?: string;
  decimals?: number | string;
  creators?: string[];
  displayUri?: string;
  artifactUri?: string;
  thumbnailUri?: string;
  formats?: Array<{ uri?: string; mimeType?: string }>;
  [key: string]: unknown;
};

type TzktToken = {
  id: number;
  contract: { address: string; alias?: string | null };
  tokenId: string;
  standard: string;
  metadata?: TzktMetadata | null;
  holdersCount?: number;
};

type TzktBalance = {
  account: { address: string };
  token: TzktToken;
  balance: string;
};

type TzktHolder = {
  account: { address: string };
  balance: string;
};

function resolveUri(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  if (uri.startsWith("tezos-storage:")) return undefined;
  return uri;
}

function pickMedia(metadata: TzktMetadata) {
  const formats = metadata.formats ?? [];
  const imageFormat = formats.find((format) =>
    format.mimeType?.toLowerCase().startsWith("image/"),
  );
  const videoFormat = formats.find((format) =>
    format.mimeType?.toLowerCase().startsWith("video/"),
  );

  const image =
    resolveUri(metadata.displayUri) ??
    resolveUri(metadata.thumbnailUri) ??
    resolveUri(imageFormat?.uri) ??
    resolveUri(metadata.artifactUri);

  return {
    image,
    video: resolveUri(videoFormat?.uri),
  };
}

function isNft(token: TzktToken) {
  if (token.standard !== "fa2") return false;
  const metadata = token.metadata;
  if (!metadata) return false;

  const decimals = metadata.decimals;
  if (metadata.symbol?.toUpperCase() === "OBJKT") return true;
  return decimals === undefined || String(decimals) === "0";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`TzKT request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchHolders(token: TzktToken): Promise<TzktHolder[]> {
  const params = new URLSearchParams({
    "token.id": String(token.id),
    "balance.gt": "0",
    limit: "10000",
    select: "account.address,balance",
  });

  try {
    return await fetchJson<TzktHolder[]>(
      `${TZKT_API}/tokens/balances?${params.toString()}`,
    );
  } catch {
    return [];
  }
}

/**
 * Live Tezos acquisitions owned by the VΣLOHE exhibition wallet.
 * The wallet is the source of discovery; curation will be added later.
 */
export async function getTezosExhibitionItems(): Promise<NftItem[]> {
  const params = new URLSearchParams({
    account: TEZOS_WALLET,
    "balance.gt": "0",
    "token.standard": "fa2",
    limit: "10000",
    "sort.desc": "lastLevel",
  });

  const balances = await fetchJson<TzktBalance[]>(
    `${TZKT_API}/tokens/balances?${params.toString()}`,
  );

  const nftBalances = balances.filter((entry) => isNft(entry.token));

  const items = await Promise.all(
    nftBalances.map(async (entry) => {
      const token = entry.token;
      const metadata = token.metadata ?? {};
      const media = pickMedia(metadata);

      if (!media.image) return null;

      const holders = await fetchHolders(token);
      const creators = metadata.creators ?? [];
      const creator = creators[0] ?? "Unknown creator";
      const collection = token.contract.alias ?? "Tezos Collection";
      const title = metadata.name?.trim() || `Tezos NFT #${token.tokenId}`;
      const holderAddresses = holders.map((holder) => holder.account.address);

      return {
        id: `TEZ-${token.id}`,
        title,
        image: media.image,
        video: media.video,
        description:
          metadata.description?.trim() ||
          `${collection} // live acquisition on Tezos.`,
        lore: [
          "LIVE TEZOS EXHIBITION RECORD",
          "",
          `Creator: ${creator}`,
          `Current holder${holderAddresses.length === 1 ? "" : "s"}: ${
            holderAddresses.length ? holderAddresses.join(", ") : TEZOS_WALLET
          }`,
          `Contract: ${token.contract.address}`,
          `Token: ${token.tokenId}`,
          `Holders: ${holderAddresses.length || token.holdersCount || 1}`,
        ].join("\n"),
        series: collection,
        rarity: "rare" as const,
        objkt: `https://objkt.com/tokens/${token.contract.address}/${token.tokenId}`,
        status: "Operational" as const,
        tags: ["tezos", "live", "acquisition"],
      } satisfies NftItem;
    }),
  );

  return items.filter((item): item is NftItem => item !== null);
}
