import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { nfts } from "@/data/nfts";

export const metadata: Metadata = {
  title: "VΣLOHE SYSTEM Archive",
  description:
    "Official recorded identities and lore — CyborgPunks · VΣLOHE SYSTEM · Lunarya.",
};

/**
 * Primary archive catalog (existing NFT grid).
 */
export default function ArchiveGalleryPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Archive // Catalog"
          title="VΣLOHE SYSTEM Archive"
          subtitle="The foundational identities of VΣLOHE SYSTEM, preserved through their on-chain records."
        />
        <NftGrid items={nfts} />
      </div>
    </PageTransition>
  );
}
