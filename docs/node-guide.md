# NODE // Archive Guide

Visitor assistant for VΣLOHE SYSTEM. It answers questions about the exhibition, routes people to the right page, and explains lore only from the existing catalog.

It does not touch wallet connection, contracts, or the visual system.

## Surfaces

- Docked panel on every page: `NODE`
- Full channel: `/node`
- API: `POST /api/agent`

## Server env

Set these in local `.env.local` and in the Vercel project. Do not commit them.

```text
XAI_API_KEY=
XAI_MODEL=grok-4
```

`XAI_MODEL` is optional. Use a smaller model if you want lower cost.

Without `XAI_API_KEY`, the panel stays visible and reports that NODE is offline.

## IP limit

Checked before the model call, so a blocked request does not spend credits.

- 8 seconds between questions
- 8 questions per 15 minutes
- 30 questions per 24 hours

The counter lives in the server instance. On Vercel it stops bursts on a warm instance; it is not a shared counter across every region.
