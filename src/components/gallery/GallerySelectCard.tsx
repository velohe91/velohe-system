"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GalleryHubEntry } from "@/data/galleries";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ACCENT = {
  cyan: {
    border: "border-neon-cyan/30 hover:border-neon-cyan/60",
    badge: "text-neon-cyan border-neon-cyan/40",
    title: "text-neon-cyan",
    cta: "text-neon-cyan group-hover:text-glow-sm",
    led: "bg-neon-cyan",
    glow: "group-hover:shadow-[0_0_32px_rgba(0,240,255,0.2)]",
  },
  violet: {
    border: "border-violet-400/30 hover:border-violet-300/60",
    badge: "text-violet-300 border-violet-400/40",
    title: "text-violet-200",
    cta: "text-violet-300 group-hover:text-violet-200",
    led: "bg-violet-400",
    glow: "group-hover:shadow-[0_0_32px_rgba(167,139,250,0.22)]",
  },
gray: {
  border: "border-white/10 hover:border-white/20",
  badge: "text-white/50 border-white/20",
  title: "text-white/60",
  cta: "text-white/40",
  led: "bg-white/30",
  glow: "",
},
} as const;

/**
 * Immersive holographic card that routes into a gallery sector.
 */
export function GallerySelectCard({
  entry,
  index,
}: {
  entry: GalleryHubEntry;
  index: number;
}) {
  const reduced = usePrefersReducedMotion();
  const a = ACCENT[entry.accent];
  const isOnline = entry.status === "online";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 0.12 * index, duration: 0.45 }}
      whileHover={reduced || !isOnline ? undefined : { y: -6 }}
      className="h-full"
    >
      <Link
        href={isOnline ? entry.href ?? "#" : "#"}
        onClick={(event) => { if (!isOnline) event.preventDefault(); }}
        tabIndex={isOnline ? undefined : -1}
        aria-disabled={!isOnline}
        className={`group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border bg-panel/90 p-6 sm:p-8 hologram-border box-glow transition-shadow focus-visible:outline-none ${a.border} ${a.glow} ${!isOnline ? "cursor-default" : ""}`}
      >
        {/* Soft corner scan accent */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl"
          style={{
            background:
              entry.accent === "cyan"
                ? "rgba(0, 240, 255, 0.35)"
                : "rgba(167, 139, 250, 0.4)",
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] ${a.badge}`}
            >
              {entry.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${a.led} ${
                  isOnline ? "animate-pulse" : "opacity-50"
                }`}
                aria-hidden
              />
              {entry.status}
            </span>
          </div>

          <h2
            className={`font-sans text-xl font-semibold tracking-wide sm:text-2xl ${a.title}`}
          >
            {entry.title}
          </h2>

          <p className="mt-3 flex-1 font-mono text-sm leading-relaxed text-muted">
            {entry.description}
          </p>

          {entry.seriesHint && (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
              {entry.seriesHint}
            </p>
          )}

          <span
            className={`mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.28em] transition-colors ${a.cta}`}
          >
            {entry.cta}
{isOnline && (
              <span
                className="translate-x-0 transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            )}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
