/**
 * Shared domain types for VΣLOHE SYSTEM.
 * Keep NFT and feed shapes here so data files stay type-safe.
 */

export type NftRarity = "common" | "rare" | "super-rare" | "epic" | "legendary" | "mythic";

export type NftStatus =
  | "Activated" | "Dormant" | "Initialization" | "Non-Linear Access"
  | "Operational" | "Supervisory Stability" | "Signal Suspension"
  | "Archived" | "Restricted" | "Unresolved" | "Compressed";

export interface NftItem {
  id: string;
  title: string;
  image: string;
  video?: string;
  description: string;
  lore: string;
  series?: string;
  rarity: NftRarity;
  marketplace?: string;
  objkt?: string;
  status?: NftStatus;
  tags?: string[];
  year?: number;
}

export type LogLevel = "INFO" | "WARN" | "SIGNAL" | "LORE" | "ERROR";
export type FeedEra = "live" | "archive";

export interface TransmissionArticle {
  kind: "transmission"; id: string; date: string; title: string; content: string;
  era: FeedEra; readingTimeMinutes?: number; relatedNftId?: string;
  tags?: string[]; blogLink?: string;
}

export interface SystemLogEntry {
  kind: "system-log"; id: string; timestamp: string; level: LogLevel;
  title?: string; message: string; era: FeedEra; relatedNftId?: string;
  blogLink?: string; status?: string; classification?: string; gallery?: string;
  image?: string; marketplace?: string; buyerProfile?: string;
  collectionLink?: string; systemArchitect?: string;
}

export interface SystemBroadcast {
  kind: "broadcast"; id: string; date: string; title: string; content: string;
  era: FeedEra; blogLink?: string;
}

export type FeedItem = TransmissionArticle | SystemLogEntry | SystemBroadcast;
export type FeedFilter = "all" | "transmissions" | "system-logs" | "broadcasts";

export type MarketCoinQuote = {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  usd: number | null;
  marketCapRank: number;
};

export type MarketPricesResponse = {
  updatedAt: string;
  coins: MarketCoinQuote[];
};
