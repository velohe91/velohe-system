"use client";

import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function EnterArchiveButton() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="mt-4"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 2.1, duration: 0.5 }}
    >
      <NeonButton href="/gallery" className="min-w-[240px] text-glow-sm">
        Enter the Archive
      </NeonButton>
    </motion.div>
  );
}
