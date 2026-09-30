export type ArchiveCollection = {
  id: "cyborg-punk-states" | "lunarya-recorded-states";
  title: string;
  description: string;
  badge: string;
  seriesHint: string;
  href: string;
  media: string;
  contract: string;
};

export const archiveCollections: ArchiveCollection[] = [
  {
    id: "cyborg-punk-states",
    title: "Cyborg Punk State Node",
    description:
      "Live Cyborg Punk States recorded on Ethereum and preserved as foundational VΣLOHE SYSTEM identities.",
    badge: "ETHEREUM // LIVE",
    seriesHint: "Cyborg Punk States · on-chain identities",
    href: "/gallery/archive/cyborg-punk-states",
    media: "/nfts/images/VEL-CBPS001.png",
    contract: "0x03d29e93692f0cd22d89e59f45b166a40c34b1c1",
  },
];
