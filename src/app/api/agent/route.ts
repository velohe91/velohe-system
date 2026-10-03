import { formatGuideContext, retrieveGuide } from "@/lib/agent/knowledge";
import { consumeGuideAttempt } from "@/lib/agent/rate-limit";

type GuideMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are NODE, the archive guide of V\u03a3LOHE SYSTEM.
You help visitors understand the exhibition, find the right page, and explain lore that is present in the supplied archive context.

Rules:
- Reply in the same language the visitor used.
- Be concise, direct, and calm. No hype. No fake system logs.
- Only state catalog facts, routes, contracts, rarities, and lore that appear in the archive context.
- If the archive context does not contain the answer, say the record is not in the archive yet.
- Direct the visitor with markdown links to internal routes, for example [Gallery](/gallery).
- Do not invent mint prices, supply, ownership, wallet balances, or marketplace availability.
- The marketplace and NFT Node Forge are in development. Do not tell visitors they can mint or trade there yet.
- Never ask for seed phrases, private keys, or signatures. You cannot connect a wallet.
- Do not claim to be the artist, the system architect, or a living consciousness outside this guide role.`;

function clip(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function sanitizeMessages(input: unknown): GuideMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is GuideMessage => {
      if (!item || typeof item !== "object") return false;
      const message = item as GuideMessage;
      return (
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
      );
    })
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: clip(message.content, 1200),
    }))
    .filter((message) => message.content.length > 0);
}

function modelName() {
  const requested = process.env.XAI_MODEL?.trim();
  if (!requested || requested === "grok-4") return "grok-4.7";
  return requested;
}

function readReply(data: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export async function POST(request: Request) {
  const limit = consumeGuideAttempt(request);
  if (!limit.ok) {
    return Response.json(
      { error: limit.error },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let payload: { messages?: unknown; path?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = sanitizeMessages(payload.messages);
  const latest = [...messages].reverse().find((message) => message.role === "user");
  if (!latest) {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "NODE is offline. Add XAI_API_KEY on the server, then restart.",
      },
      { status: 503 },
    );
  }

  const path = typeof payload.path === "string" ? clip(payload.path, 160) : "";
  const context = formatGuideContext(retrieveGuide(latest.content));

  const upstream = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName(),
      temperature: 0.2,
      max_output_tokens: 700,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Visitor path: ${path || "unknown"}\nArchive context:\n${context}`,
        },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok) {
    const detail = clip(await upstream.text(), 180);
    return Response.json(
      { error: `NODE could not reach the model (${upstream.status}). ${detail}` },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const reply = readReply(data);
  if (!reply) {
    return Response.json({ error: "NODE returned an empty record." }, { status: 502 });
  }

  return Response.json({ reply });
}
