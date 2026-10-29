import type { Metadata } from "next";
import { GallerySelectCard } from "@/components/gallery/GallerySelectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import type { GalleryHubEntry } from "@/data/galleries";

export const metadata: Metadata = {
  title: "Velozart",
  description: "Enter Velozart: Panim Pixel Studio and the NFT Velozart gallery.",
};

const velozartEntries: GalleryHubEntry[] = [
  {
    id: "velozart",
    title: "Panim Pixel Studio",
    description:
      "A local-first pixel art and animation workspace. Draw, refine, animate, and export your artwork directly in the browser.",
    href: "/velozart/pixel-lab",
    badge: "CREATIVE LAB",
    seriesHint: "DRAW · ANIMATE · CREATE",
    cta: "Enter Pixel Studio",
    accent: "cyan",
    status: "online",
  },
  {
    id: "node-forge",
    title: "NFT Velozart",
    description:
      "Explore the Velozart NFT collection. The existing gallery is available here; live CryptoPanim collection integration can be added in a later step.",
    href: "/gallery/velozart",
    badge: "NFT COLLECTION",
    seriesHint: "DIGITAL ARTIFACTS",
    cta: "Explore Collection",
    accent: "violet",
    status: "online",
  },
];

export default function VelozartPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <SectionHeading
          eyebrow="VΣLOHE SYSTEM // VELOZART"
          title="Velozart"
          subtitle="Choose your destination: create pixel art in Panim Pixel Studio or enter the NFT Velozart gallery."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {velozartEntries.map((entry, index) => (
            <GallerySelectCard key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
