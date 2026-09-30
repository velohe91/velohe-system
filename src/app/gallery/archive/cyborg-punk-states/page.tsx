import type { Metadata } from "next";
import { NftGrid } from "@/components/gallery/NftGrid";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { getLiveCyborgPunkStates } from "@/lib/web3/velohe-archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cyborg Punk State Node",
  description:
    "Live Cyborg Punk States preserved within the VΣLOHE SYSTEM Archive.",
};

export default async function CyborgPunkStatesPage() {
  const nfts = await getLiveCyborgPunkStates();

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Archive // Collection Node"
          title="Cyborg Punk State Node"
          subtitle="Live Cyborg Punk States preserved through their Ethereum on-chain records."
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
