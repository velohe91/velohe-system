"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const LINES = [
  { text: "> BOOT SEQUENCE INITIATED…", delay: 0.4 },
  { text: "> SYSTEM ONLINE", delay: 0.9 },
  { text: "> ARCHIVE LINK STABLE", delay: 1.3 },
  { text: "> LIVE NFT ARCHIVE READY", delay: 1.7 },
  { text: "> MARKET TICKERS ONLINE", delay: 2.1 },
  { text: "> WEB3 NETWORK LAYER STABLE", delay: 2.5 },
  { text: "> MINTING SOON", delay: 2.9 },
];

/**
 * Terminal-style intro lines that fade/type in on the landing page.
 */
export function SystemBootSequence() {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className="mx-auto mt-8 w-full max-w-md space-y-2 rounded-md border border-neon-cyan/20 bg-panel/60 p-4 font-mono text-left text-xs sm:text-sm"
      role="status"
      aria-live="polite"
    >
      {LINES.map((line) => (
        <motion.p
          key={line.text}
          className={
            line.text.includes("ONLINE")
              ? "text-neon-cyan text-glow-sm"
              : "text-muted"
          }
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : line.delay, duration: 0.35 }}
        >
          {line.text}
        </motion.p>
      ))}
      <motion.span
        className="inline-block h-4 w-2 bg-neon-cyan align-middle"
        animate={reduced ? undefined : { opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        aria-hidden
      />
    </div>
  );
}
