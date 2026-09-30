import { getNftById } from "@/data/nfts";
import type { NftItem, NftRarity } from "@/lib/types";

const CYBORG_PUNK_STATES_CONTRACT =
  "0x03d29e93692f0cd22d89e59f45b166a40c34b1c1";

const LUNARYA_RECORDED_STATES_CONTRACT =
  "0x936f35db20399803edd5b57f1d2ea4e6e51b67e9";

const OPEN_SEA_API_URL =
  "https://api.opensea.io/api/v2/chain/ethereum/contract";

type OpenSeaNft = {
  identifier: string;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  animation_url?: string | null;
  original_animation_url?: string | null;
  metadata_url?: string | null;
  opensea_url?: string | null;
  traits?: Array<{ trait_type?: string; value?: string | number | null }>;
};

type OpenSeaResponse = {
  nfts?: OpenSeaNft[];
  next?: string | null;
};

function rarityFromTraits(traits: OpenSeaNft["traits"]): NftRarity {
  const value = traits
    ?.find((trait) => trait.trait_type?.toLowerCase() === "rarity")
    ?.value;

  switch (String(value ?? "").toLowerCase()) {
    case "rare":
      return "rare";
    case "super-rare":
    case "super rare":
      return "super-rare";
    case "epic":
      return "epic";
    case "legendary":
      return "legendary";
    case "mythic":
      return "mythic";
    default:
      return "common";
  }
}

function normalizeCyborgPunk(nft: OpenSeaNft): NftItem {
  const tokenId = nft.identifier;
  const legacy = getNftById(
    `VEL-CBPS${tokenId.padStart(3, "0")}`,
  );

  return {
    id: `VEL-CBPS${tokenId.padStart(3, "0")}`,
    title: nft.name?.trim() || legacy?.title || `Cyborg Punk State #${tokenId}`,
    image: nft.image_url || legacy?.image || "",
    video:
      nft.original_animation_url || nft.animation_url || legacy?.video,
    description:
      nft.description?.trim() ||
      legacy?.description ||
      "Live Cyborg Punk State recorded on Ethereum.",
    lore:
      legacy?.lore ||
      nft.description?.trim() ||
      "Live Cyborg Punk State recorded on Ethereum.",
    series: "Cyborg Punk States",
    rarity: rarityFromTraits(nft.traits),
    marketplace:
      nft.opensea_url ||
      `https://opensea.io/item/ethereum/${CYBORG_PUNK_STATES_CONTRACT}/${tokenId}`,
    status: legacy?.status ?? "Activated",
    year: legacy?.year ?? 2045,
    tags: legacy?.tags ?? ["cyborg-punk", "state", "ethereum"],
  };
}

let cyborgPunkStatesPromise: Promise<OpenSeaNft[]> | null = null;

async function fetchCyborgPunkStates(): Promise<OpenSeaNft[]> {
  const apiKey = process.env.OPENSEA_API_KEY;

  if (!apiKey) {
    console.error("[VΣLOHE Archive] OPENSEA_API_KEY is not configured");
    return [];
  }

  if (!cyborgPunkStatesPromise) {
    cyborgPunkStatesPromise = (async () => {
      const response = await fetch(
        `${OPEN_SEA_API_URL}/${CYBORG_PUNK_STATES_CONTRACT}/nfts?limit=200`,
        {
          headers: {
            "X-API-KEY": apiKey,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const body = await response.text();
        console.error(
          `[VΣLOHE Archive] OpenSea API error ${response.status}: ${body}`,
        );
        cyborgPunkStatesPromise = null;
        return [];
      }

      const payload = (await response.json()) as OpenSeaResponse;
      return payload.nfts ?? [];
    })().catch((error) => {
      cyborgPunkStatesPromise = null;
      console.error(
        "[VΣLOHE Archive] OpenSea Cyborg Punk States fetch failed:",
        error,
      );
      return [];
    });
  }

  return cyborgPunkStatesPromise;
}

export async function getLiveCyborgPunkStates(): Promise<NftItem[]> {
  try {
    const nfts = await fetchCyborgPunkStates();
    return nfts.map(normalizeCyborgPunk).filter((nft) => Boolean(nft.image || nft.video));
  } catch (error) {
    console.error(
      "[VΣLOHE Archive] Failed to load live Cyborg Punk States:",
      error,
    );
    return [];
  }
}


function normalizeLunarya(nft: OpenSeaNft): NftItem {
  const tokenId = nft.identifier;
  const legacy = getNftById(
    `VEL-LRS${tokenId === "2" ? "01" : tokenId === "4" ? "02" : tokenId === "6" ? "03" : tokenId === "8" ? "04" : tokenId === "7" ? "05" : tokenId.padStart(2, "0")}`,
  );

  return {
    id: legacy?.id ?? `VEL-LRS${tokenId.padStart(2, "0")}`,
    title: nft.name?.trim() || legacy?.title || `Lunarya Recorded State #${tokenId}`,
    image: nft.image_url || legacy?.image || "",
    video: nft.animation_url || legacy?.video,
    description:
      nft.description?.trim() ||
      legacy?.description ||
      "Live Lunarya Recorded State recorded on Ethereum.",
    lore:
      legacy?.lore ||
      nft.description?.trim() ||
      "Live Lunarya Recorded State recorded on Ethereum.",
    series: "Lunarya Recorded States",
    rarity: rarityFromTraits(nft.traits),
    marketplace:
      nft.opensea_url ||
      `https://opensea.io/item/ethereum/${LUNARYA_RECORDED_STATES_CONTRACT}/${tokenId}`,
    objkt: legacy?.objkt,
    status: legacy?.status ?? "Initialization",
    year: legacy?.year ?? 2052,
    tags: legacy?.tags ?? ["lunarya", "recorded-state", "ethereum"],
  };
}

export async function getLiveLunaryaRecordedStates(): Promise<NftItem[]> {
  const apiKey = process.env.OPENSEA_API_KEY;

  try {
    const response = await fetch(
      `${OPEN_SEA_API_URL}/${LUNARYA_RECORDED_STATES_CONTRACT}/nfts?limit=200`,
      {
        headers: {
          Accept: "application/json",
          ...(apiKey ? { "X-API-KEY": apiKey } : {}),
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        `[VΣLOHE Archive] OpenSea request failed for Lunarya: ${response.status}`,
      );
      return [];
    }

    const payload = (await response.json()) as OpenSeaResponse;

    return (payload.nfts ?? [])
      .map(normalizeLunarya)
      .filter((nft) => Boolean(nft.image));
  } catch (error) {
    console.error(
      "[VΣLOHE Archive] Failed to load Lunarya Recorded States",
      error,
    );
    return [];
  }
}
