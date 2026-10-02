"use client";

import type { ReactNode } from "react";
import { ParticleField } from "@/components/effects/ParticleField";
import { Scanlines } from "@/components/effects/Scanlines";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CoreSpiritInformationBlock } from "@/components/game/CoreSpiritInformationBlock";

/**
 * Global chrome: particles, scanlines, nav, and footer around page content.
 */
export function ImmersiveShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ParticleField />
      <Scanlines />
      <Navbar />
      <main className="relative z-10 flex-1 pt-16">
        {children}
        <CoreSpiritInformationBlock />
      </main>
      <Footer />
    </div>
  );
}
