/**
 * Shared domain types for VΣLOHE SYSTEM.
 * Keep NFT and feed shapes here so data files stay type-safe.
 */

export type NftRarity =
  | "common"
  | "rare"
  | "super-rare"
  | "epic"
  | "legendary"
  | "mythic";

/** System phase / operational status shown on cards and modal */
export type NftStatus =
  | "Activated"
  | "Dormant"
  | "Initialization"
  | "Non-Linear Access"
  | "Operational"
  | "Supervisory Stability"
  | "Signal Suspension"
  | "Archived"
  | "Restricted"
  | "Unresolved"
  | "Compressed";

export interface NftItem {
  /** Unique catalog ID, e.g. "VEL-001" */
  id: string;
  title: string;
  /** Static cover / poster under /public */
  image: string;
  /** Optional loop or cinematic under /public */
  video?: string;
  /** Short blurb for cards / previews */
  description: string;
  /** Longer multi-line lore shown in the detail modal */
  lore: string;
  /** Optional collection / series name */
  series?: string;
  /** Stored lowercase: common | rare | super-rare | epic | legendary | mythic */
  rarity: NftRarity;
  /** Optional OpenSea listing URL */
  marketplace?: string;
  /** Optional Objkt (Tezos) listing URL */
  objkt?: string;
  status?: NftStatus;
  tags?: string[];
  year?: number;
}

export type LogLevel = "INFO" | "WARN" | "SIGNAL" | "LORE" | "ERROR";

/**
 * Live ≈ BC + TX-VΣ## + LOG-VΣ##
 * Archive ≈ TX-001–008 / LOG-001–009
 */
export type FeedEra = "live" | "archive";

/** Long-form archive article shown as an expandable card */
export interface TransmissionArticle {
  kind: "transmission";
  id: string;
  /** ISO-style or archive clock — used for sort + display */
  date: string;
  title: string;
  /** Full long-form body (plain text paragraphs) */
  content: string;
  /** Live feed vs sealed archives */
  era: FeedEra;
  /** Optional; derived from word count when omitted */
  readingTimeMinutes?: number;
  relatedNftId?: string;
  tags?: string[];
  /** Original post on the VΣLOHE blog */
  blogLink?: string;
}

/** Short terminal-style system log line */
export interface SystemLogEntry {
  kind: "system-log";
  id: string;
  timestamp: string;
  level: LogLevel;
  /** Optional display title for the log entry */
  title?: string;
  /** Short terminal line / multi-line log text */
  message: string;
  /** Live feed vs sealed archives */
  era: FeedEra;
  relatedNftId?: string;
  /** Original post on the VΣLOHE blog */
  blogLink?: string;
  /** Optional operational status (e.g. COMPLETED, ACTIVE) */
  status?: string;
  /** Optional classification label (e.g. PUBLIC RECORD) */
  classification?: string;
  /** Optional gallery wing name */
  gallery?: string;
  /** Optional illustration under /public */
  image?: string;
  /** External marketplace URL (Objkt / OpenSea) — rendered as a link */
  marketplace?: string;
  /** Buyer / collector profile URL — rendered as a link */
  buyerProfile?: string;
  /** Protocol / collection overview URL (not a sale) — rendered as a link */
  collectionLink?: string;
  /** Optional system architect credit */
  systemArchitect?: string;
}

/** System-wide broadcast — prominent live-channel entry */
export interface SystemBroadcast {
  kind: "broadcast";
  id: string;
  date: string;
  title: string;
  content: string;
  era: FeedEra;
  blogLink?: string;
}

export type FeedItem =
  | TransmissionArticle
  | SystemLogEntry
  | SystemBroadcast;

export type FeedFilter =
  | "all"
  | "transmissions"
  | "system-logs"
  | "broadcasts";

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
