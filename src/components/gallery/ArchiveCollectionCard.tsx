"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  title: string;
  description: string;
  badge: string;
  seriesHint: string;
  href: string;
  media?: string;
  mediaType?: "image" | "video";
  index: number;
};

export function ArchiveCollectionCard({
  title,
  description,
  badge,
  seriesHint,
  href,
  media,
  mediaType = "image",
  index,
}: Props) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 0.12 * index, duration: 0.45 }}
      whileHover={reduced ? undefined : { y: -6 }}
      className="h-full"
    >
      <Link
        href={href}
        className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-neon-cyan/30 bg-panel/90 hologram-border box-glow transition-shadow hover:border-neon-cyan/60 hover:shadow-[0_0_32px_rgba(0,240,255,0.2)] focus-visible:outline-none"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-void cyber-grid">
          {media ? (
            mediaType === "video" ? (
              <video
                src={media}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={media}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center bg-void px-6 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-neon-cyan/70">
                Live Archive Node
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-90" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded border border-neon-cyan/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-neon-cyan">
              {badge}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" aria-hidden />
              online
            </span>
          </div>

          <h2 className="font-sans text-xl font-semibold tracking-wide text-neon-cyan sm:text-2xl">
            {title}
          </h2>

          <p className="mt-3 flex-1 font-mono text-sm leading-relaxed text-muted">
            {description}
          </p>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
            {seriesHint}
          </p>

          <span className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.28em] text-neon-cyan transition-colors group-hover:text-glow-sm">
            Enter Node
            <span
              className="translate-x-0 transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
