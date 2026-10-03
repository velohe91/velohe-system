/**
 * Grounding index for the in-app guide.
 * Built from existing catalog data so the node does not invent archive entries.
 */

import { aboutLore, deepLore } from "@/data/lore";
import { archiveCollections } from "@/data/archive-collections";
import { galleryHubEntries } from "@/data/galleries";
import { nfts } from "@/data/nfts";
import { velozartNfts } from "@/data/velozart-nfts";
import { communityAcquisitions } from "@/data/community-acquisitions";
import { archiveFeedItems, liveFeedItems } from "@/data/feed";
import type { FeedItem, NftItem } from "@/lib/types";

export type GuideRecord = {
  id: string;
  kind: string;
  title: string;
  href?: string;
  text: string;
};

const SITE_MAP: GuideRecord[] = [
  {
    id: "route-home",
    kind: "route",
    title: "Home",
    href: "/",
    text: "Boot screen for V\u03a3LOHE SYSTEM. Entry into the exhibition archive.",
  },
  {
    id: "route-gallery",
    kind: "route",
    title: "Gallery",
    href: "/gallery",
    text: "Gallery hub. Sectors: official archive, community exhibition node, and the standby minting sector (NFT Node Forge).",
  },
  {
    id: "route-archive",
    kind: "route",
    title: "Archive",
    href: "/gallery/archive",
    text: "Official recorded identities: Cyborg Punk States, Lunarya Recorded States, Aethergrid Spirits, and VELOHE SYSTEM nodes.",
  },
  {
    id: "route-exhibition",
    kind: "route",
    title: "NFT Exhibition Node",
    href: "/gallery/exhibition-node",
    text: "Curated artworks acquired from the V\u03a3LOHE community and preserved in the system.",
  },
  {
    id: "route-velozart",
    kind: "route",
    title: "VeLozArt",
    href: "/gallery/velozart",
    text: "VeLozArt wing of the gallery.",
  },
  {
    id: "route-transmissions",
    kind: "route",
    title: "Transmissions",
    href: "/transmissions",
    text: "Chronological feed of live transmissions, system logs, and broadcasts. Older sealed records live in the archive era of the same feed.",
  },
  {
    id: "route-about",
    kind: "route",
    title: "About",
    href: "/about",
    text: "Official primer: what V\u03a3LOHE SYSTEM is, what The Aethergrid is, and the meaning of \u03a3.",
  },
  {
    id: "route-lore",
    kind: "route",
    title: "Lore vault",
    href: "/lore",
    text: "Deep vault: CyborgPunks, Lunarya, and The Aethergrid Spirits.",
  },
  {
    id: "route-unknown",
    kind: "route",
    title: "Unknown Sector",
    href: "/UnknownSector/theaethergrid",
    text: "Recovered Aethergrid sector. A sealed narrative channel, separate from the main gallery catalog.",
  },
  {
    id: "route-game",
    kind: "route",
    title: "Game protocol",
    href: "/game",
    text: "Game whitepaper and protocol notes for The Aethergrid experience.",
  },
  {
    id: "route-arcade",
    kind: "route",
    title: "Arcade",
    href: "/arcade",
    text: "Playable Aethergrid sector. Core spirits: Cyan, Purple, Gold, Void, Dual.",
  },
  {
    id: "route-node",
    kind: "route",
    title: "Archive guide",
    href: "/node",
    text: "This guide. It answers questions about the exhibition, lore, routes, and catalog. It does not sign transactions or access wallets.",
  },
  {
    id: "project-status",
    kind: "project",
    title: "Project status",
    text: "V\u03a3LOHE SYSTEM is an immersive NFT exhibition archive. Archive, exhibition, and transmissions are active. Web3 wallet connection is evolving. The multi-chain marketplace and NFT Node Forge minting sector are in development, not a live marketplace.",
  },
  {
    id: "project-chains",
    kind: "project",
    title: "Chains",
    text: "Recorded archive collections currently point at Ethereum contracts. The long-term marketplace direction names Ethereum, BNB Chain, Solana, Tezos, and Polygon. Do not claim those marketplace flows are live.",
  },
  {
    id: "project-wallet",
    kind: "project",
    title: "Wallet",
    text: "Wallet connection is a visitor action in the existing Web3 chrome. The guide must not ask for seed phrases, private keys, or signatures, and must not invent balances or mint prices.",
  },
];

function clip(value: string, max = 420) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}\u2026` : clean;
}

function nftRecord(item: NftItem, wing: string, href: string): GuideRecord {
  return {
    id: item.id,
    kind: "artifact",
    title: item.title,
    href,
    text: [
      `Wing: ${wing}`,
      item.series ? `Series: ${item.series}` : "",
      `Rarity: ${item.rarity}`,
      item.status ? `Status: ${item.status}` : "",
      item.year ? `Year: ${item.year}` : "",
      item.tags?.length ? `Tags: ${item.tags.join(", ")}` : "",
      clip(item.description),
      clip(item.lore, 280),
    ]
      .filter(Boolean)
      .join(" | "),
  };
}

function feedRecord(item: FeedItem): GuideRecord {
  const href = "/transmissions";
  if (item.kind === "transmission") {
    return {
      id: item.id,
      kind: "transmission",
      title: item.title,
      href,
      text: `${item.era} transmission \u00b7 ${item.date}. ${clip(item.content, 360)}`,
    };
  }
  if (item.kind === "broadcast") {
    return {
      id: item.id,
      kind: "broadcast",
      title: item.title,
      href,
      text: `${item.era} broadcast \u00b7 ${item.date}. ${clip(item.content, 360)}`,
    };
  }
  return {
    id: item.id,
    kind: "system-log",
    title: item.title ?? item.id,
    href,
    text: `${item.era} ${item.level} log \u00b7 ${item.timestamp}. ${clip(item.message, 360)}`,
  };
}

function loreRecords(): GuideRecord[] {
  return [
    {
      id: "lore-what",
      kind: "lore",
      title: aboutLore.whatIs.title,
      href: "/about",
      text: clip(aboutLore.whatIs.paragraphs.join(" "), 700),
    },
    {
      id: "lore-aethergrid",
      kind: "lore",
      title: aboutLore.aethergrid.title,
      href: "/about",
      text: clip(
        [aboutLore.aethergrid.summary, ...aboutLore.aethergrid.paragraphs].join(" "),
        700,
      ),
    },
    {
      id: "lore-sigma",
      kind: "lore",
      title: aboutLore.sigma.title,
      href: "/about",
      text: clip(aboutLore.sigma.paragraphs.join(" "), 700),
    },
    {
      id: "lore-cyborgpunks",
      kind: "lore",
      title: deepLore.cyborgPunks.title,
      href: "/lore",
      text: clip(deepLore.cyborgPunks.paragraphs.join(" "), 700),
    },
    {
      id: "lore-lunarya",
      kind: "lore",
      title: deepLore.lunarya.title,
      href: "/lore",
      text: clip(deepLore.lunarya.paragraphs.join(" "), 700),
    },
    {
      id: "lore-spirits-vault",
      kind: "lore",
      title: deepLore.aethergridSpirits.title,
      href: "/lore",
      text: clip(deepLore.aethergridSpirits.paragraphs.join(" "), 700),
    },
  ];
}

export function guideRecords(): GuideRecord[] {
  return [
    ...SITE_MAP,
    ...galleryHubEntries.map((entry) => ({
      id: `hub-${entry.id}`,
      kind: "gallery",
      title: entry.title,
      href: entry.href,
      text: `${entry.badge}. Status: ${entry.status}. ${entry.description} ${entry.seriesHint ?? ""}`,
    })),
    ...archiveCollections.map((entry) => ({
      id: `collection-${entry.id}`,
      kind: "collection",
      title: entry.title,
      href: entry.href,
      text: `${entry.badge}. ${entry.seriesHint}. ${entry.description} Contract: ${entry.contract}`,
    })),
    ...loreRecords(),
    ...nfts.map((item) => nftRecord(item, "official catalog", "/gallery/archive")),
    ...velozartNfts.map((item) =>
      nftRecord(item, "VeLozArt", "/gallery/velozart"),
    ),
    ...communityAcquisitions.map((item) =>
      nftRecord(item, "Exhibition Node", "/gallery/exhibition-node"),
    ),
    ...liveFeedItems.map(feedRecord),
    ...archiveFeedItems.map(feedRecord),
  ];
}

export function retrieveGuide(query: string, limit = 8): GuideRecord[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9\u03a3]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);

  const ranked = guideRecords()
    .map((record) => {
      const haystack = `${record.title} ${record.kind} ${record.text} ${record.href ?? ""}`.toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { record, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.record);

  return ranked.length > 0 ? ranked : SITE_MAP.slice(0, 6);
}

export function formatGuideContext(records: GuideRecord[]) {
  return records
    .map((record) => {
      const link = record.href ? ` (${record.href})` : "";
      return `- [${record.kind}] ${record.title}${link}: ${record.text}`;
    })
    .join("\n");
}
