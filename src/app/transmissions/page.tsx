import type { Metadata } from "next";
import { CommsStream } from "@/components/transmissions/CommsStream";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageTransition } from "@/components/ui/PageTransition";
import { archiveFeedItems, liveFeedItems } from "@/data/feed";

export const metadata: Metadata = {
  title: "Transmissions",
  description:
    "Live Outer Mesh signals and sealed archives — long-form transmissions and system logs from VΣLOHE.",
};

export default function TransmissionsPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <SectionHeading
          eyebrow="Comms // Stream"
          title="Transmissions"
          subtitle="Live Feed: system broadcasts and TX-VΣ (newest first). Archives: LOG-VΣ, TX-001–008, and LOG-001–009."
        />
        <CommsStream
          liveItems={liveFeedItems}
          archiveItems={archiveFeedItems}
        />
      </div>
    </PageTransition>
  );
}
