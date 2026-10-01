import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { getLiveAethergridSpirits } from "@/lib/web3/velohe-archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Aethergrid Spirits Node",
  description:
    "Live Aethergrid Spirits preserved within the VΣLOHE SYSTEM Archive.",
};

export default async function AethergridSpiritsPage() {
  const nfts = await getLiveAethergridSpirits();

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Archive // Collection Node"
          title="The Aethergrid Spirits Node"
          subtitle="Live Aethergrid Spirits preserved through their Ethereum on-chain records."
        />

        {nfts.length > 0 ? (
          <NftGrid items={nfts} />
        ) : (
          <div className="rounded-xl border border-neon-cyan/20 bg-panel/70 p-8 text-center hologram-border">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
              No live spirits available
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
