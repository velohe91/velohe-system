"use client";

import type { FeedEra } from "@/lib/types";

const ERAS: {
  id: FeedEra;
  label: string;
  hint: string;
}[] = [
  { id: "live", label: "Live Feed", hint: "BC · TX-VΣ" },
  { id: "archive", label: "Archives", hint: "Sealed · LOG-VΣ · TX/LOG 001–009" },
];

export function EraTabs({
  value,
  onChange,
  counts,
}: {
  value: FeedEra;
  onChange: (next: FeedEra) => void;
  counts: { live: number; archive: number };
}) {
  return (
    <div
      role="tablist"
      aria-label="Feed era"
      className="mb-4 inline-flex flex-wrap gap-1 rounded-lg border border-neon-blue/30 bg-black/50 p-1"
    >
      {ERAS.map((era) => {
        const active = value === era.id;
        const count = counts[era.id];
        const isArchive = era.id === "archive";
        return (
          <button
            key={era.id}
            type="button"
            role="tab"
            aria-selected={active}
            id={`era-tab-${era.id}`}
            title={era.hint}
            className={[
              "rounded-md px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all sm:px-5 sm:text-xs",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-cyan/70",
              active && !isArchive
                ? "bg-neon-cyan/15 text-neon-cyan box-glow border border-neon-cyan/50"
                : active && isArchive
                  ? "bg-violet-500/15 text-violet-300 box-glow border border-violet-400/45"
                  : "border border-transparent text-muted hover:border-neon-blue/30 hover:text-foreground",
            ].join(" ")}
            onClick={() => onChange(era.id)}
          >
            {era.label}
            <span
              className={`ml-2 tabular-nums ${
                active
                  ? isArchive
                    ? "text-violet-300/80"
                    : "text-neon-cyan/80"
                  : "text-muted/60"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
