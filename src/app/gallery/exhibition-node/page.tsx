import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { getTezosExhibitionItems } from "@/lib/tezos/exhibition";

export const metadata: Metadata = {
  title: "NFT Exhibition Node",
  description:
    "Live Tezos acquisitions held by VΣLOHE SYSTEM and showcased in the exhibition node.",
};

/**
 * Live exhibition wing — discovers NFTs currently held by the VΣLOHE Tezos wallet.
 */
export default async function ExhibitionNodePage() {
  const tezosNfts = await getTezosExhibitionItems();

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Node // Tezos Live Acquisitions"
          title="NFT Exhibition Node"
          subtitle="A living exhibition of artworks acquired by VΣLOHE SYSTEM — sourced live from Tezos and preserved within the system."
        />
        <NftGrid items={tezosNfts} />
      </div>
    </PageTransition>
  );
}
