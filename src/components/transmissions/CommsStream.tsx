"use client";

import { useCallback, useMemo, useState } from "react";
import type { FeedEra, FeedFilter, FeedItem, NftItem } from "@/lib/types";
import { countByKind, filterFeedItems } from "@/lib/feed";
import { getNftById } from "@/data/nfts";
import { EraTabs } from "@/components/transmissions/EraTabs";
import { FeedFilterTabs } from "@/components/transmissions/FeedFilterTabs";
import { TransmissionCard } from "@/components/transmissions/TransmissionCard";
import { SystemLogLine } from "@/components/transmissions/SystemLogLine";
import { BroadcastCard } from "@/components/transmissions/BroadcastCard";
import { NftModal } from "@/components/gallery/NftModal";

export function CommsStream({
  liveItems,
  archiveItems,
}: {
  liveItems: FeedItem[];
  archiveItems: FeedItem[];
}) {
  const [era, setEra] = useState<FeedEra>("live");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);

  const openRelatedNft = useCallback((nftId: string) => {
    const nft = getNftById(nftId);
    if (nft) setSelectedNft(nft);
  }, []);

  const closeNftModal = useCallback(() => {
    setSelectedNft(null);
  }, []);

  const eraItems = era === "live" ? liveItems : archiveItems;
  const eraCounts = useMemo(
    () => ({
      live: liveItems.length,
      archive: archiveItems.length,
    }),
    [liveItems, archiveItems],
  );
  const kindCounts = useMemo(() => countByKind(eraItems), [eraItems]);
  const visible = useMemo(
    () => filterFeedItems(eraItems, filter),
    [eraItems, filter],
  );

  const isArchive = era === "archive";

  return (
    <div className="mx-auto max-w-2xl">
      <EraTabs value={era} onChange={setEra} counts={eraCounts} />

      {isArchive ? (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-violet-300/70">
          {"// sealed channel · LOG-VΣ · TX-001–008 · LOG-001–009 · newest first"}
        </p>
      ) : (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan/70">
          {"// live channel · BC · TX-VΣ · newest first"}
        </p>
      )}

      <FeedFilterTabs value={filter} onChange={setFilter} counts={kindCounts} />

      <div className="relative">
        <div
          className={
            isArchive
              ? "absolute bottom-0 left-[5px] top-0 w-px bg-gradient-to-b from-violet-400/50 via-violet-500/20 to-transparent"
              : "absolute bottom-0 left-[5px] top-0 w-px bg-gradient-to-b from-neon-cyan/80 via-neon-cyan/30 to-transparent"
          }
          aria-hidden
        />

        {visible.length === 0 ? (
          <p className="pl-8 font-mono text-sm text-muted">
            {isArchive
              ? "// no sealed entries in this channel"
              : "// no live entries in this channel"}
          </p>
        ) : (
          <div
            className="flex flex-col gap-5"
            role="tabpanel"
            aria-labelledby={`era-tab-${era}`}
          >
            {visible.map((item, i) => {
              if (item.kind === "broadcast") {
                return (
                  <BroadcastCard key={item.id} entry={item} index={i} />
                );
              }
              if (item.kind === "transmission") {
                return (
                  <TransmissionCard
                    key={item.id}
                    entry={item}
                    index={i}
                    onOpenRelatedNft={openRelatedNft}
                  />
                );
              }
              return (
                <SystemLogLine
                  key={item.id}
                  entry={item}
                  index={i}
                  onOpenRelatedNft={openRelatedNft}
                />
              );
            })}
          </div>
        )}
      </div>

      <NftModal nft={selectedNft} onClose={closeNftModal} />
    </div>
  );
}
