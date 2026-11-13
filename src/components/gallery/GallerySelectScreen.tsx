"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { GallerySelectCard } from "@/components/gallery/GallerySelectCard";
import { galleryHubEntries } from "@/data/galleries";
import { EnterArchiveButton } from "@/components/home/EnterArchiveButton";

/**
 * Gallery gate — pick a sector before entering a catalog.
 */
export function GallerySelectScreen() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Exhibition // Gate"
        title="Gallery"
        subtitle="Choose a sector to enter. Each wing holds a distinct archive of identities and artworks."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {galleryHubEntries
          .filter((entry) => entry.id !== "exhibition-node")
          .map((entry, i) => (
          <GallerySelectCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <EnterArchiveButton />
      </div>
    </div>
  );
}
