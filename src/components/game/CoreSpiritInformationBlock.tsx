"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CORE_SPIRITS = [
  {
    code: "AGS-001",
    sector: "SECTOR 01",
    spirit: "CYAN SPIRIT",
    tier: "COMMON",
    core: "CYAN CIRCLE",
    video: "/game/arcade/cores/cyan-core.mp4",
    accent: "#20e7ff",
  },
  {
    code: "AGS-002",
    sector: "SECTOR 02",
    spirit: "PURPLE SPIRIT",
    tier: "UNCOMMON",
    core: "PURPLE DIAMOND",
    video: "/game/arcade/cores/purple-core.mp4",
    accent: "#b46cff",
  },
  {
    code: "AGS-003",
    sector: "SECTOR 03",
    spirit: "GOLD SPIRIT",
    tier: "RARE",
    core: "GOLD HEXAGON",
    video: "/game/arcade/cores/gold-core.mp4",
    accent: "#ffd75a",
  },
  {
    code: "AGS-004",
    sector: "SECTOR 04",
    spirit: "VOID SPIRIT",
    tier: "ULTRA RARE",
    core: "VOID SPIRAL",
    video: "/game/arcade/cores/void-core.mp4",
    accent: "#ff5d9e",
  },
  {
    code: "AGS-005",
    sector: "SECTOR 05",
    spirit: "DUAL-CORE SPIRIT",
    tier: "LEGENDARY",
    core: "DUAL-CORE SPLIT",
    video: "/game/arcade/cores/dual-core.mp4",
    accent: "#e9f7ff",
  },
] as const;

function detectSectorIndex() {
  const text = document.body.innerText;
  const match = text.match(/AGS-00([1-5])\s*\/\/\s*SECTOR\s*0([1-5])/i);
  if (!match) return 0;

  return Math.max(0, Math.min(CORE_SPIRITS.length - 1, Number(match[1]) - 1));
}

export function CoreSpiritInformationBlock() {
  const pathname = usePathname();
  const [sectorIndex, setSectorIndex] = useState(0);
  const spirit = CORE_SPIRITS[sectorIndex];

  useEffect(() => {
    if (pathname !== "/arcade") return;

    const syncSector = () => {
      const nextIndex = detectSectorIndex();
      setSectorIndex((current) => (current === nextIndex ? current : nextIndex));
    };

    syncSector();

    const observer = new MutationObserver(syncSector);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [pathname]);

  if (pathname !== "/arcade") return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-0 sm:px-6 lg:px-8">
      <div
        className="overflow-hidden rounded-2xl border bg-black/55 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
        style={{ borderColor: `${spirit.accent}55` }}
      >
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.35em]"
            style={{ color: spirit.accent }}
          >
            CORE SPIRIT INFORMATION BLOCK
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
            <span>{spirit.code}</span>
            <span>{"//"}</span>
            <span>{spirit.sector}</span>
            <span>{"//"}</span>
            <span>THE AETHERGRID SPIRITS</span>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="relative aspect-video overflow-hidden bg-black">
            <video
              key={spirit.video}
              className="h-full w-full object-cover"
              src={spirit.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `inset 0 0 70px ${spirit.accent}18` }}
            />
          </div>

          <div className="flex flex-col justify-center gap-5 border-t border-white/10 p-6 md:border-l md:border-t-0 lg:p-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                AETHERGRID DESIGNATION
              </p>
              <h2
                className="mt-2 font-mono text-xl font-semibold uppercase tracking-[0.12em] sm:text-2xl"
                style={{ color: spirit.accent }}
              >
                {spirit.spirit}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
              <div className="border border-white/10 bg-white/[0.025] p-3">
                <p className="text-white/30">TIER</p>
                <p className="mt-2 text-white/80">{spirit.tier}</p>
              </div>
              <div className="border border-white/10 bg-white/[0.025] p-3">
                <p className="text-white/30">CORE</p>
                <p className="mt-2 text-white/80">{spirit.core}</p>
              </div>
            </div>

            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
              VΣLOHE SYSTEM // AETHERGRID // {spirit.code}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
