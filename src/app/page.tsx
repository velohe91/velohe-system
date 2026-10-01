"use client";

import { GlowOrb } from "@/components/effects/GlowOrb";
import { AnimatedLogo } from "@/components/home/AnimatedLogo";
import { SystemBootSequence } from "@/components/home/SystemBootSequence";
import { EnterArchiveButton } from "@/components/home/EnterArchiveButton";
import { PlayGameButton } from "@/components/home/PlayGameButton";
import { MintSoonButton } from "@/components/home/MintSoonButton";
import { SITE_TAGLINE } from "@/lib/constants";
import { motion } from "framer-motion";

/**
 * Landing — boot sequence + cinematic entry into the archive.
 */
export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-16">
      <GlowOrb className="-left-20 top-20 h-72 w-72" color="blue" />
      <GlowOrb className="-right-16 bottom-24 h-80 w-80" color="cyan" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <motion.p
          className="mb-4 font-mono text-[10px] uppercase tracking-[0.45em] text-muted sm:text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {SITE_TAGLINE}
        </motion.p>

        <AnimatedLogo />

        <motion.p
          className="mt-4 max-w-lg font-mono text-xs text-muted sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          NFT Exhibition Node. Collected artifacts, sealed crypto arts, and
          system lore — rendered under Web 3.0.
        </motion.p>

        <SystemBootSequence />
        <PlayGameButton />
        <MintSoonButton />
        <EnterArchiveButton />
      </div>
    </section>
  );
}
