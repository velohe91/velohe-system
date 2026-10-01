"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { NftItem } from "@/lib/types";
import { RARITY_COLORS } from "@/lib/constants";

type Props = {
  nft: NftItem | null;
  onClose: () => void;
  mediaAspect?: "square" | "portrait";
};


/** Classify optional motion asset: GIF uses <img>, MP4/WebM use <video>. */
function getMotionKind(src?: string): "gif" | "video" | null {
  if (!src) return null;
  if (/\.gif(\?|#|$)/i.test(src)) return "gif";
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(src)) return "video";
  // Unknown extension — try as video for archive compatibility
  return "video";
}

/**
 * Accessible lore modal: Esc / backdrop / close button, focus return, scroll lock.
 * Portaled to document.body so it escapes main/nav stacking contexts.
 *
 * Media:
 * - `image` (.jpg/.png) = still frame (grid + modal “Still”)
 * - `video` (.gif) = animated loop via <img>
 * - `video` (.mp4/…) = HTML5 video with image as poster
 */
export function NftModal({
  nft,
  onClose,
  mediaAspect = "square",
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!nft) return;

    const prev = document.activeElement as HTMLElement | null;
    // Always open scrolled to the top (title / media first).
    // Focus Close with preventScroll so the browser does not jump to the footer.
    const focusTimer = window.setTimeout(() => {
      contentRef.current && (contentRef.current.scrollTop = 0);
      dialogRef.current && (dialogRef.current.scrollTop = 0);
      closeRef.current?.focus({ preventScroll: true });
    }, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [nft, onClose]);

  if (!mounted) return null;

  const rarityClass = nft
    ? RARITY_COLORS[nft.rarity] ?? RARITY_COLORS.common
    : "";
  const motionKind = nft ? getMotionKind(nft.video) : null;
  const showMotion = Boolean(nft?.video);
  const mediaAspectClass =
    mediaAspect === "portrait" ? "aspect-[9/16]" : "aspect-square";

  return createPortal(
    <AnimatePresence>
      {nft && (
        <motion.div
          key={nft.id}
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          {/* Backdrop — click outside to close */}
          <button
            type="button"
            className="absolute inset-0 bg-void/85 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border border-neon-cyan/30 bg-panel box-glow-strong sm:rounded-xl"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid min-h-0 gap-0 md:grid-cols-2">
              {/* Media: still (image) + optional motion (gif / mp4) */}
              <div
                className={`relative ${mediaAspectClass} shrink-0 bg-void cyber-grid md:min-h-[320px]`}
              >
                {showMotion && motionKind === "gif" && nft.video ? (
                  // GIF must use <img> — <video> cannot play animated GIFs
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={nft.video}
                    src={nft.video}
                    alt={`${nft.title} — animation`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : showMotion && motionKind === "video" && nft.video ? (
                  <video
                    key={nft.video}
                    src={nft.video}
                    poster={nft.image || undefined}
                    autoPlay
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label={`${nft.title} — video`}
                  />
                ) : (
                  <Image
                    key={nft.image}
                    src={nft.image}
                    alt={`${nft.title} — still`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                )}

              </div>

              <div
                ref={contentRef}
                key={`scroll-${nft.id}`}
                className="flex min-h-0 max-h-[50dvh] flex-col overflow-y-auto p-5 sm:max-h-none sm:p-6 md:max-h-[70dvh]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs tracking-widest text-neon-blue">
                    {nft.id}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${rarityClass}`}
                  >
                    {nft.rarity}
                  </span>
                </div>

                <h2
                  id={titleId}
                  className="font-sans text-xl font-bold tracking-wide text-glow-sm sm:text-2xl"
                >
                  {nft.title}
                </h2>

                <p className="mt-2 font-mono text-sm leading-relaxed text-muted">
                  {nft.description}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px] text-muted">
                  {nft.series && (
                    <>
                      <dt className="text-neon-cyan/70">Series</dt>
                      <dd>{nft.series}</dd>
                    </>
                  )}
                  {nft.status && (
                    <>
                      <dt className="text-neon-cyan/70">System Phase</dt>
                      <dd>{nft.status}</dd>
                    </>
                  )}
                  {nft.year && (
                    <>
                      <dt className="text-neon-cyan/70">Year</dt>
                      <dd>{nft.year}</dd>
                    </>
                  )}
                </dl>

                <div className="mt-5 border-t border-neon-cyan/15 pt-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">
                    Lore
                  </p>
                  <p className="whitespace-pre-line font-mono text-sm leading-relaxed text-foreground/90">
                    {nft.lore}
                  </p>
                </div>

                {nft.tags && nft.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {nft.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded border border-neon-blue/25 px-2 py-0.5 font-mono text-[10px] text-muted"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {nft.marketplace && (
                    <a
                      href={nft.marketplace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md border border-neon-cyan/50 bg-neon-cyan/10 px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-neon-cyan transition-colors hover:border-neon-cyan hover:bg-neon-cyan/20 sm:w-auto"
                    >
                      OpenSea
                    </a>
                  )}
                  {nft.objkt && (
                    <a
                      href={nft.objkt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md border border-neon-soft/50 bg-neon-soft/10 px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-neon-soft transition-colors hover:border-neon-soft hover:bg-neon-soft/20 sm:w-auto"
                    >
                      Objkt
                    </a>
                  )}
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center rounded-md border border-neon-blue/40 px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-neon-blue transition-colors hover:border-neon-cyan hover:text-neon-cyan sm:w-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
