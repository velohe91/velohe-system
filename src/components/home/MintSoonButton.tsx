"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Disabled CTA — minting is not available yet.
 */
export function MintSoonButton() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="mt-4"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 2.7, duration: 0.45 }}
    >
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="min-w-[240px] cursor-not-allowed rounded border border-neon-blue/15 bg-transparent px-6 py-3 font-sans text-sm uppercase tracking-[0.18em] text-muted/60 opacity-70"
      >
        Mint Soon
      </button>
    </motion.div>
  );
}
