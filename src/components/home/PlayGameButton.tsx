"use client";

import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Secondary CTA — enters the Game Protocol wing (under construction).
 * Styled more subtly than Enter the Archive.
 */
export function PlayGameButton() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="mt-4"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 2.35, duration: 0.45 }}
    >
      <NeonButton
        href="/arcade"
        variant="outline"
        className="min-w-[240px] border-neon-blue/30 text-neon-blue/85 hover:border-neon-cyan/50 hover:text-neon-cyan/90"
      >
        ARCADE
      </NeonButton>
    </motion.div>
  );
}
