"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { GlowOrb } from "@/components/effects/GlowOrb";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STATUS_BADGES = [
  "UNDER CONSTRUCTION",
  "ACTIVE DEVELOPMENT",
  "WEB3 OPTIONAL",
] as const;

type EntityId =
  | "lunarya"
  | "virex"
  | "arc"
  | "bunny"
  | "droid";

type Entity = {
  id: EntityId;
  name: string;
  classification: string;
  status: string;
  access: string;
  description: string;
};

const ENTITIES: Record<EntityId, Entity> = {
  lunarya: {
    id: "lunarya",
    name: "LUNARYA",
    classification: "RESEARCHER // SYSTEM ARCHITECT",
    status: "ACTIVE",
    access: "RESTRICTED",
    description:
      "Researcher connected to the development of VΣLOHE SYSTEM and the discovery of the Aethergrid. Her work remains at the center of the system's unresolved history.",
  },

  virex: {
    id: "virex",
    name: "VIREX",
    classification: "CYBORGPUNK // CREW UNIT",
    status: "DORMANT",
    access: "SEALED",
    description:
      "One of the CyborgPunk entities preserved within the VΣLOHE SYSTEM. The dormant units may eventually become part of an Operator's crew, assisting with exploration, scanning and sector investigation.",
  },

  arc: {
    id: "arc",
    name: "ARC",
    classification: "CYBORGPUNK // UNKNOWN STATE",
    status: "DORMANT",
    access: "SEALED",
    description:
      "A preserved CyborgPunk entity whose activation is connected to an unresolved event within the system. Its role remains partially classified.",
  },

  bunny: {
    id: "bunny",
    name: "NEONBYTE BUNNY",
    classification: "WORKFORCE // PRODUCTION UNIT",
    status: "ACTIVE",
    access: "STANDARD",
    description:
      "NeonByte Bunnies are the workforce of the system. They collect resources, generate NeoBytes and operate the infrastructure required to expand an Operator's Node.",
  },

  droid: {
    id: "droid",
    name: "AETHERGRID DROID",
    classification: "DEFENSE // SYSTEM UNIT",
    status: "STANDBY",
    access: "LOCKED",
    description:
      "Aethergrid Droids are advanced defensive units connected to the discovery and recovery of Aethergrid technology. Their full capabilities remain locked until the system is ready.",
  },
};

type Hotspot = {
  id: EntityId;
  label: string;
  x: string;
  y: string;
  width: string;
  height: string;
};

/**
 * Hotspot calibration for the official Layer Final.
 *
 * The positions are intentionally kept relatively tight so that each
 * interactive point corresponds to the actual character instead of
 * covering large unrelated areas of the scene.
 */
const HOTSPOTS: Hotspot[] = [
  {
    id: "lunarya",
    label: "Lunarya",
    x: "39%",
    y: "43%",
    width: "17%",
    height: "25%",
  },
  {
  id: "virex",
  label: "Virex",
  x: "3%",
  y: "25%",
  width: "14%",
  height: "28%",
},
{
  id: "arc",
  label: "ARC",
  x: "17%",
  y: "25%",
  width: "14%",
  height: "28%",
},
  {
    id: "bunny",
    label: "NeonByte Bunny",
    x: "61%",
    y: "54%",
    width: "13%",
    height: "28%",
  },
  {
    id: "droid",
    label: "Aethergrid Droid",
    x: "76%",
    y: "32%",
    width: "14%",
    height: "35%",
  },
];

function EntityModal({
  entity,
  onClose,
}: {
  entity: Entity;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-dialog-title"
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neon-cyan/40 bg-black/90 p-6 shadow-[0_0_50px_rgba(0,220,255,0.18)]"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-neon-cyan/70"
          animate={{
            opacity: [0.2, 0.8, 0.2],
            y: [0, 360, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="border-b border-neon-cyan/20 pb-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-neon-cyan/60">
            VΣLOHE SYSTEM // ENTITY SCAN
          </div>

          <h2
            id="entity-dialog-title"
            className="mt-2 font-sans text-2xl font-semibold tracking-wide text-neon-cyan text-glow-sm"
          >
            {entity.name}
          </h2>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            {entity.classification}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-widest">
            <div className="rounded border border-neon-cyan/15 bg-neon-cyan/[0.03] p-3">
              <div className="text-muted">STATUS</div>
              <div className="mt-1 text-neon-cyan">{entity.status}</div>
            </div>

            <div className="rounded border border-neon-cyan/15 bg-neon-cyan/[0.03] p-3">
              <div className="text-muted">ACCESS</div>
              <div className="mt-1 text-neon-cyan">{entity.access}</div>
            </div>
          </div>

          <p className="font-mono text-sm leading-relaxed text-muted">
            {entity.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-neon-cyan/15 pt-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neon-cyan/40">
            CONNECTION // PARTIAL
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded border border-neon-cyan/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-neon-cyan transition hover:border-neon-cyan hover:bg-neon-cyan/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Interactive Game Protocol hub — /game
 *
 * The Research Lab image acts as the first interactive preview
 * of the VΣLOHE SYSTEM game.
 */
export function GameProtocolView() {
  const reduced = usePrefersReducedMotion();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-16">
      <GlowOrb className="-left-24 top-16 h-64 w-64" color="blue" />
      <GlowOrb className="-right-20 bottom-20 h-72 w-72" color="cyan" />

      <motion.div
        className="relative z-10 w-full max-w-6xl"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="panel hologram-border rounded-xl px-4 py-8 sm:px-8 sm:py-10">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-neon-cyan/70">
              Protocol // Interactive Layer
            </p>

            <h1 className="mt-4 font-sans text-2xl font-semibold tracking-wide text-neon-cyan text-glow-sm sm:text-3xl md:text-4xl">
              GAME PROTOCOL — IN DEVELOPMENT
            </h1>

            <p className="mx-auto mt-4 max-w-md font-mono text-sm leading-relaxed text-muted sm:text-base">
              Build your Node. Expand the Network. Reach the Aethergrid.
            </p>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {STATUS_BADGES.map((badge) => (
                <li
                  key={badge}
                  className="rounded border border-amber-400/40 bg-amber-500/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-amber-200/90"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Research Node */}
          <div className="mx-auto mt-10 w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neon-cyan/50">
                Research Node // 01
              </span>

              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neon-cyan/40">
                Interactive
              </span>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-neon-cyan/20 bg-black/60 shadow-[0_0_40px_rgba(0,220,255,0.08)]">
              <Image
                src="/game/the-aethergrid-final.png"
                alt="VΣLOHE SYSTEM Research Laboratory"
                width={1920}
                height={1080}
                priority
                className="block h-auto w-full"
              />

              {/* Invisible character interaction zones */}
              {HOTSPOTS.map((hotspot) => {
                const entity = ENTITIES[hotspot.id];

                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    aria-label={`Inspect ${entity.name}`}
                    onClick={() => setSelectedEntity(entity)}
                    className="group absolute rounded-lg border border-transparent bg-transparent transition-all duration-200 hover:border-neon-cyan/40 hover:bg-neon-cyan/[0.04] focus:border-neon-cyan/60 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    style={{
                      left: hotspot.x,
                      top: hotspot.y,
                      width: hotspot.width,
                      height: hotspot.height,
                    }}
                  >
                    <span className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan opacity-0 shadow-[0_0_12px_rgba(0,220,255,0.9)] transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100" />

                    <span className="pointer-events-none absolute left-1/2 top-[calc(50%+14px)] -translate-x-1/2 whitespace-nowrap rounded border border-neon-cyan/30 bg-black/80 px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-neon-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
                      {hotspot.label}
                    </span>
                  </button>
                );
              })}

              {/* Node status overlay */}
              <div className="pointer-events-none absolute left-3 top-3 rounded border border-neon-cyan/20 bg-black/60 px-3 py-2 backdrop-blur-sm">
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-neon-cyan/50">
                  NODE 01
                </div>

                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neon-cyan">
                  RESEARCH LAB
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 right-3 rounded border border-neon-cyan/20 bg-black/60 px-3 py-2 backdrop-blur-sm">
                <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-neon-cyan/50">
                  ENTITIES DETECTED
                </div>

                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neon-cyan">
                  05 // INTERACT
                </div>
              </div>
            </div>

            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Select an entity to inspect the available system record.
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-center font-mono text-xs leading-relaxed text-muted sm:text-sm">
            The interactive game layer is in active development. Operators will
            build Nodes, deploy agents, and push toward contact with the
            Aethergrid — while the exhibition archive remains fully intact.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <NeonButton
              href="/game/whitepaper"
              className="min-w-[200px] text-glow-sm"
            >
              Read Whitepaper
            </NeonButton>

            <NeonButton
              href="/arcade"
              className="min-w-[200px] text-glow-sm"
            >
              Aethergrid Arcade
            </NeonButton>

            <NeonButton href="/" variant="outline" className="min-w-[200px]">
              Return to Archive
            </NeonButton>
          </div>
        </div>
      </motion.div>

      {/* Entity holographic interface */}
      <AnimatePresence>
        {selectedEntity && (
          <EntityModal
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}