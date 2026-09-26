/**
 * Gallery hub sectors — selection cards on /gallery.
 * Each entry routes to a sub-gallery (archive catalog, VeLozArt wing, etc.).
 */

export type GalleryHubAccent = "cyan" | "violet" | "gray";
export type GalleryHubStatus = "online" | "standby";

export type GalleryHubEntry = {
  id: "archive" | "exhibition-node" | "velozart" | "node-forge";
  title: string;
  description: string;
  href?: string;
  badge: string;
  seriesHint?: string;
  cta: string;
  accent: GalleryHubAccent;
  status: GalleryHubStatus;
};

export const galleryHubEntries: GalleryHubEntry[] = [
  {
    id: "archive",
    title: "VΣLOHE SYSTEM Archive",
    description:
      "The official recorded identities and lore of VΣLOHE SYSTEM",
    href: "/gallery/archive",
    badge: "PRIMARY ARCHIVE",
    seriesHint: "CyborgPunks · VΣLOHE SYSTEM · Lunarya",
    cta: "Enter Archive",
    accent: "cyan",
    status: "online",
  },
  {
    id: "exhibition-node",
    title: "NFT Exhibition Node",
    description:
      "A curated record of artworks acquired from the VΣLOHE community and preserved within the system.",
    href: "/gallery/exhibition-node",
    badge: "COMMUNITY ACQUISITIONS",
    seriesHint: "Verified community artworks · expanding archive",
    cta: "Enter Exhibition Node",
    accent: "violet",
    status: "online",
  },
{
  id: "node-forge",
  title: "NFT NODE FORGE",
  description:
    "The sector for upcoming NFT releases, allowlist registration, and future mint operations within VΣLOHE SYSTEM.",
  badge: "MINTING SECTOR",
  seriesHint: "Upcoming drops · allowlist registration",
  cta: "Enter Minting Sector",
  accent: "gray",
  status: "standby",
},
  

];
