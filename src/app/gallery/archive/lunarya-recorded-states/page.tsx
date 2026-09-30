import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { getLiveLunaryaRecordedStates } from "@/lib/web3/velohe-archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lunarya Recorded State Node",
  description:
    "Live Lunarya Recorded States preserved within the VΣLOHE SYSTEM Archive.",
};

export default async function LunaryaRecordedStatesPage() {
  const nfts = await getLiveLunaryaRecordedStates();

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Archive // Collection Node"
          title="Lunarya Recorded State Node"
          subtitle="Live Lunarya Recorded States preserved through their Ethereum on-chain records."
        />

        {nfts.length > 0 ? (
          <NftGrid items={nfts} />
        ) : (
          <div className="rounded-xl border border-neon-cyan/20 bg-panel/70 p-8 text-center hologram-border">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
              No live states available
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
