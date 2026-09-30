"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { NftItem } from "@/lib/types";
import { RARITY_COLORS } from "@/lib/constants";

type Props = {
  nft: NftItem;
  index: number;
  onOpen: (nft: NftItem) => void;
};

export function NftCard({ nft, index, onOpen }: Props) {
  const rarityClass = RARITY_COLORS[nft.rarity] ?? RARITY_COLORS.common;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(nft)}
      className="group relative z-0 flex w-full flex-col overflow-hidden rounded-lg border border-neon-cyan/20 bg-panel/80 text-left hologram-border box-glow transition-shadow hover:box-glow-strong focus-visible:outline-none"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div className="relative aspect-square overflow-hidden bg-void cyber-grid">
        {nft.video ? (
          <video
            src={nft.video}
            poster={nft.image || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            aria-label={`${nft.title} — video`}
          />
        ) : (
          /* unoptimized: serve /public paths as-is (avoids optimizer 404/timeouts on large NFT media) */
          <Image
            src={nft.image}
            alt={nft.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[10px] tracking-widest text-neon-blue">
            {nft.id}
          </span>
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${rarityClass}`}
          >
            {nft.rarity}
          </span>
        </div>
        <h3 className="font-sans text-sm font-semibold tracking-wide text-foreground sm:text-base">
          {nft.title}
        </h3>
        <p className="line-clamp-2 font-mono text-[11px] leading-relaxed text-muted">
          {nft.description}
        </p>
        <div className="mt-auto flex flex-col gap-1 pt-1 font-mono text-[10px] tracking-wide text-muted/80">
          {nft.series && (
            <p className="uppercase tracking-widest text-neon-cyan/70">
              {nft.series}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {nft.status && <span>{nft.status}</span>}
            {nft.status && nft.year && (
              <span className="text-muted/50" aria-hidden>
                ·
              </span>
            )}
            {nft.year && <span>{nft.year}</span>}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
