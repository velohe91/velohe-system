/**
 * App-wide constants: routes, branding, and chrome copy.
 */

export const SITE_NAME = "V\u03a3LOHE SYSTEM";
export const SITE_TAGLINE = "NFT Exhibition System";
export const SITE_VERSION = "v2.0";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/transmissions", label: "Transmissions" },
  { href: "/about", label: "About" },
  { href: "/UnknownSector/theaethergrid", label: "Unknown Sector" },
  { href: "/node", label: "Node" },
] as const;

export const RARITY_COLORS: Record<string, string> = {
  common: "text-slate-300 border-slate-500/50",
  rare: "text-sky-300 border-sky-400/60",
  "super-rare": "text-fuchsia-300 border-fuchsia-400/60",
  epic: "text-violet-300 border-violet-400/60",
  legendary: "text-amber-300 border-amber-400/60",
  mythic: "text-cyan-300 border-cyan-300/80",
};
