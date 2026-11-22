"use client";

import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function EnterArchiveButton({
  href = "/velozart/pixel-lab",
  label = "Panim Pixel Studio",
}: {
  href?: string;
  label?: string;
} = {}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="mt-4"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 2.1, duration: 0.5 }}
    >
      <NeonButton href={href} className="min-w-[240px] text-glow-sm">
        {label}
      </NeonButton>
    </motion.div>
  );
}
