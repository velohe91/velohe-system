export type ArchiveCollection = {
  id:
    | "cyborg-punk-states"
    | "lunarya-recorded-states"
    | "aethergrid-spirits"
    | "velohe-system";
  title: string;
  description: string;
  badge: string;
  seriesHint: string;
  href: string;
  media: string;
  mediaType: "image" | "video";
  contract: string;
};

export const archiveCollections: ArchiveCollection[] = [
  {
    id: "aethergrid-spirits",
    title: "The Aethergrid Spirits Node",
    description:
      "Live Aethergrid Spirits recorded on Ethereum and preserved as foundational VΣLOHE SYSTEM identities.",
    badge: "ETHEREUM // LIVE",
    seriesHint: "The Aethergrid Spirits · on-chain identities",
    href: "/gallery/archive/aethergrid-spirits",
    media: "/about/aethergrid-spirits.mp4",
    mediaType: "video",
    contract: "0x407ccb1e09eb93525c2a5d12aeb1a46da135d737",
  },
  {
    id: "cyborg-punk-states",
    title: "Cyborg Punk State Node",
    description:
      "Live Cyborg Punk States recorded on Ethereum and preserved as foundational VΣLOHE SYSTEM identities.",
    badge: "ETHEREUM // LIVE",
    seriesHint: "Cyborg Punk States · on-chain identities",
    href: "/gallery/archive/cyborg-punk-states",
    media: "/nfts/nodes/all-nodes.mp4",
    mediaType: "video",
    contract: "0x03d29e93692f0cd22d89e59f45b166a40c34b1c1",
  },
  {
    id: "velohe-system",
    title: "VELOHE SYSTEM Node",
    description:
      "Live VELOHE SYSTEM identities recorded on Ethereum and preserved within the official system archive.",
    badge: "ETHEREUM // LIVE",
    seriesHint: "VELOHE SYSTEM · on-chain identities",
    href: "/gallery/archive/velohe-system",
    media: "/about/velohe-system.mp4",
    mediaType: "video",
    contract: "0xd9ca0acaa8ff27f75965d52e56dd9e9c5b6c9c6c",
  },
  {
    id: "lunarya-recorded-states",
    title: "Lunarya Recorded State Node",
    description:
      "Live Lunarya Recorded States preserved on Ethereum as foundational VΣLOHE SYSTEM identities.",
    badge: "ETHEREUM // LIVE",
    seriesHint: "Lunarya Recorded States · on-chain identities",
    href: "/gallery/archive/lunarya-recorded-states",
    media: "/nfts/videos/VEL-LRS05.mp4",
    mediaType: "video",
    contract: "0x936f35db20399803edd5b57f1d2ea4e6e51b67e9",
  },
];
