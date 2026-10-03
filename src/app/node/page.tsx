import type { Metadata } from "next";
import { SystemNode } from "@/components/agent/SystemNode";
import { PageTransition } from "@/components/ui/PageTransition";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Archive Guide",
  description:
    "Ask NODE where to go in VΣLOHE SYSTEM and what the archive, lore, and transmissions mean.",
};

export default function NodePage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <SectionHeading
          eyebrow="NODE // VISITOR CHANNEL"
          title="Archive Guide"
          subtitle="Questions about the exhibition, collections, lore, and where to go next."
        />
        <SystemNode variant="page" />
      </div>
    </PageTransition>
  );
}
