import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { communityAcquisitions } from "@/data/community-acquisitions";
import { getTezosExhibitionItems } from "@/lib/tezos/exhibition";

export const metadata: Metadata = {
  title: "NFT Exhibition Node",
  description:
    "Community artworks acquired by VΣLOHE SYSTEM and preserved in the exhibition node.",
};

/**
 * Community acquisition wing — live Tezos inventory with the existing
 * community acquisition set as a resilient fallback.
 */
export default async function ExhibitionNodePage() {
  let exhibitionItems = communityAcquisitions;

  try {
    const liveTezosItems = await getTezosExhibitionItems();
    exhibitionItems = liveTezosItems;
  } catch {
    // Keep the exhibition renderable if TzKT is temporarily unavailable.
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Node // Tezos Live Acquisitions"
          title="NFT Exhibition Node"
          subtitle="A living exhibition of artworks acquired by VΣLOHE SYSTEM — sourced live from Tezos and preserved within the system."
        />
        <NftGrid items={exhibitionItems} />
      </div>
    </PageTransition>
  );
}
