"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type GuideMessage = {
  role: "user" | "assistant";
  content: string;
};

const COOLDOWN_MS = 8000;

const PROMPTS = [
  "What is V\u03a3LOHE SYSTEM?",
  "Where do I enter the archive?",
  "What are the Aethergrid Spirits?",
  "\u00bfQu\u00e9 puedo hacer en esta web?",
];

function renderReply(content: string) {
  const parts = content.split(/(\[.+?\]\(\/[^)\s]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(.+?)\]\((\/[^)\s]+)\)$/);
    if (!match) return <span key={index}>{part}</span>;
    return (
      <Link key={index} href={match[2]} className="text-cyan-300 underline">
        {match[1]}
      </Link>
    );
  });
}

export function SystemNode({
  variant = "dock",
}: {
  variant?: "dock" | "page";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(variant === "page");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const cooldownUntilRef = useRef(0);
  const [messages, setMessages] = useState<GuideMessage[]>([
    {
      role: "assistant",
      content:
        "NODE online. Ask where to go, or what an archive, transmission, or collection means.",
    },
  ]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const locked = pending || cooldownLeft > 0;

  function startCooldown(ms = COOLDOWN_MS) {
    const until = Date.now() + ms;
    cooldownUntilRef.current = until;
    setCooldownUntil(until);
    setNow(Date.now());
  }

  if (variant === "dock" && pathname === "/node") return null;

  async function ask(text: string) {
    const content = text.trim();
    if (!content || pending || Date.now() < cooldownUntilRef.current) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    setError("");
    setPending(true);
    startCooldown();
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          messages: next.filter((_, index) => index > 0),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        if (response.status === 429 && retryAfter > 8) startCooldown(retryAfter * 1000);
        setError(data.error || "NODE did not answer.");
        return;
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply as string },
      ]);
    } catch {
      setError("Signal lost. Try again.");
    } finally {
      setPending(false);
    }
  }

  const panel = (
    <section className="flex h-full min-h-0 flex-col border border-cyan-400/40 bg-[#03050a]/95 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <header className="flex items-center justify-between border-b border-cyan-400/30 px-3 py-2 font-mono text-[11px] tracking-[0.18em] text-cyan-200">
        <span>NODE // ARCHIVE GUIDE</span>
        {variant === "dock" ? (
          <button type="button" onClick={() => setOpen(false)} className="text-cyan-300">
            CLOSE
          </button>
        ) : (
          <span>ONLINE</span>
        )}
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 font-mono text-sm leading-relaxed">
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "text-slate-200" : "text-cyan-100"}
          >
            <span className="mr-2 text-[10px] tracking-[0.14em] text-cyan-400">
              {message.role === "user" ? "VISITOR" : "NODE"}
            </span>
            {message.role === "assistant" ? renderReply(message.content) : message.content}
          </p>
        ))}
        {pending ? <p className="text-cyan-400">Receiving record\u2026</p> : null}
        {error ? <p className="text-amber-300">{error}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-cyan-400/20 px-3 py-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={locked}
            onClick={() => ask(prompt)}
            className="border border-cyan-400/30 px-2 py-1 font-mono text-[10px] tracking-wide text-cyan-200 disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-cyan-400/30 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={cooldownLeft > 0 ? `Next signal in ${cooldownLeft}s` : "Ask about the archive"}
          disabled={locked}
          className="min-w-0 flex-1 border border-cyan-400/30 bg-transparent px-2 py-2 font-mono text-sm text-cyan-50 outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={locked}
          className="min-w-16 border border-cyan-300/70 px-3 font-mono text-xs tracking-[0.16em] text-cyan-200 disabled:opacity-50"
        >
          {cooldownLeft > 0 ? `${cooldownLeft}s` : "SEND"}
        </button>
      </form>
      {variant === "dock" ? (
        <Link href="/node" className="px-3 pb-3 font-mono text-[10px] tracking-[0.16em] text-cyan-400">
          OPEN FULL NODE
        </Link>
      ) : null}
    </section>
  );

  if (variant === "page") {
    return <div className="h-[70dvh] w-full">{panel}</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(100vw-2rem,24rem)]">
      {open ? (
        <div className="mb-2 h-[min(70dvh,32rem)]">{panel}</div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto block border border-cyan-300/70 bg-[#03050a]/90 px-3 py-2 font-mono text-xs tracking-[0.2em] text-cyan-200"
        >
          NODE
        </button>
      )}
    </div>
  );
}
