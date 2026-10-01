import type { Metadata } from "next";
import { ArchiveCollectionCard } from "@/components/gallery/ArchiveCollectionCard";
import { GalleryBackLink } from "@/components/gallery/GalleryBackLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { archiveCollections } from "@/data/archive-collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VΣLOHE SYSTEM Archive",
  description:
    "The foundational identities of VΣLOHE SYSTEM, preserved through their on-chain records.",
};

export default async function ArchiveGalleryPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <GalleryBackLink />
        <SectionHeading
          eyebrow="Archive // Catalog"
          title="VΣLOHE SYSTEM Archive"
          subtitle="The foundational identities of VΣLOHE SYSTEM, preserved through their on-chain records."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {archiveCollections.map((collection, index) => (
            <ArchiveCollectionCard
              key={collection.id}
              title={collection.title}
              description={collection.description}
              badge={collection.badge}
              seriesHint={collection.seriesHint}
              href={collection.href}
              media={collection.media}
              mediaType={collection.mediaType}
              index={index}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
