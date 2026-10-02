"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NftItem } from "@/lib/types";
import { RARITY_COLORS } from "@/lib/constants";

type Props = {
  nft: NftItem;
  index: number;
  onOpen: (nft: NftItem) => void;
  mediaAspect?: "square" | "portrait";
};

export function NftCard({
  nft,
  index,
  onOpen,
  mediaAspect = "square",
}: Props) {
  const rarityClass = RARITY_COLORS[nft.rarity] ?? RARITY_COLORS.common;
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const mediaAspectClass =
    mediaAspect === "portrait" ? "aspect-[9/16]" : "aspect-square";
  const isAethergrid = nft.series === "The Aethergrid Spirits";
  const isCyborgPunk = nft.series === "Cyborg Punk States";
  const isLunarya = nft.series === "Lunarya Recorded States";
  const isVeloheSystem = nft.series === "VELOHE SYSTEM";
  const nftNumber = nft.id.match(/(\d+)$/)?.[1];
  const staticImage =
    isAethergrid &&
    nftNumber &&
    Number(nftNumber) >= 1 &&
    Number(nftNumber) <= 22
      ? `/nfts/images/${nftNumber.padStart(3, "0")}.png`
      : isCyborgPunk && nft.id.startsWith("VEL-CBPS") && nftNumber
        ? `/nfts/images/VEL-CBPS${nftNumber.padStart(3, "0")}.png`
        : isLunarya && nft.id.startsWith("VEL-LRS") && nftNumber
          ? `/nfts/images/LRS${nftNumber.padStart(2, "0")}.png`
          : isVeloheSystem && nft.id.startsWith("VEL-VSYS") && nftNumber
            ? `/nfts/images/AGD-${nftNumber.padStart(2, "0")}.png`
            : nft.image;
  const showMobileVideo = isMobile && Boolean(nft.video);
  const showDesktopVideo = !isMobile && Boolean(nft.video) && isHovered;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(nft)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative z-0 flex w-full flex-col overflow-hidden rounded-lg border border-neon-cyan/20 bg-panel/80 text-left hologram-border box-glow transition-shadow hover:box-glow-strong focus-visible:outline-none"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div
        className={`relative ${mediaAspectClass} overflow-hidden bg-void cyber-grid`}
      >
        {/* Keep the static first-frame image mounted until the card is hovered. */}
        <Image
          src={staticImage}
          alt={nft.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            showMobileVideo || showDesktopVideo ? "opacity-0" : "opacity-100"
          }`}
          priority={index < 4}
        />

        {nft.video && (showMobileVideo || showDesktopVideo) && (
          <video
            key={nft.video}
            src={nft.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            aria-label={`${nft.title} — preview`}
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
