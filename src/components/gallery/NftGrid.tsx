"use client";

import { useState, useCallback, useMemo } from "react";
import type { NftItem } from "@/lib/types";
import { nftIdNumber } from "@/data/nfts";
import { NftCard } from "@/components/gallery/NftCard";
import { NftModal } from "@/components/gallery/NftModal";

type Props = {
  items: NftItem[];
  mediaAspect?: "square" | "portrait";
};

export function NftGrid({ items, mediaAspect = "square" }: Props) {
  const [selected, setSelected] = useState<NftItem | null>(null);

  // Oldest / genesis first: CPC001…005 → CBPS001…005 → LRS01…05 at the bottom.
  const ordered = useMemo(
    () =>
      [...items].sort((a, b) => nftIdNumber(a.id) - nftIdNumber(b.id)),
    [items],
  );

  const open = useCallback((nft: NftItem) => {
    setSelected(nft);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <>
      {/* Responsive grid: 1 → 2 (sm) → 3 (md) → 5 (lg+) · genesis first */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {ordered.map((nft, i) => (
          <NftCard
            key={nft.id}
            nft={nft}
            index={i}
            onOpen={open}
            mediaAspect={mediaAspect}
          />
        ))}
      </div>
      <NftModal nft={selected} onClose={close} mediaAspect={mediaAspect} />
    </>
  );
}
