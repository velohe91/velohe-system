/**
 * Long-form transmissions (articles).
 * Live ≈ TX-VΣ## · Archive ≈ TX-001–008
 * Merged/sorted in data/feed.ts.
 *
 * HOW TO ADD A TRANSMISSION:
 * 1. Push a new object with kind: "transmission" and era: "live" | "archive"
 * 2. Use a unique `id` and a display `date`
 * 3. Write full multi-paragraph `content`
 * 4. Optionally set `relatedNftId` / `tags` / `readingTimeMinutes` / `blogLink`
 */

import type { TransmissionArticle } from "@/lib/types";

export const transmissionArticles: TransmissionArticle[] = [
  // ─── Live (TX-VΣ##) — sorted newest-first in feed.ts ───
  {
    kind: "transmission",
    era: "live",
    id: "TX-VΣ05",
    date: "2026.10.01_22:00",
    title: "ARCADE PROTOCOL — SCORE LAYER INITIALIZED",
    tags: ["arcade", "game", "score", "nft", "web3"],
    content: `The ARCADE layer is now active within VΣLOHE SYSTEM.

The game is still under development, but its purpose is already defined: play, accumulate score, and turn performance into access.

Arcade score will be designed as a future reward mechanism for obtaining NFTs within the VΣLOHE ecosystem.

The system is not ready to issue those rewards yet. The score economy, reward rules, and NFT integration remain under development.

For now, the objective is simple:

PLAY.
SCORE.
CLIMB.

Your score will matter when the ARCADE reward layer goes live.

ARCADE PROTOCOL: IN DEVELOPMENT.
SCORE UTILITY: NFT REWARD LAYER PLANNED.
REWARD INTEGRATION: PENDING.`,
  },
  {
    kind: "transmission",
    era: "live",
    id: "TX-VΣ04",
    date: "2026.10.01_21:30",
    title: "LIVE NFT ARCHIVE — ON-CHAIN RECORDS CONNECTED",
    tags: ["live nft", "archive", "ethereum", "on-chain", "web3"],
    content: `The VΣLOHE SYSTEM Archive has entered a new state.

Live NFT collections are now being connected to their on-chain records and displayed directly through the system archive.

The archive is no longer only a catalog of preserved identities. It now reads live collection data and presents those identities as active system records.

Collection nodes are online. NFT records are being synchronized. The archive layer is live.

LIVE NFT ARCHIVE: ACTIVE.
ON-CHAIN RECORDS: CONNECTED.
COLLECTION NODES: ONLINE.`,
  },
  {
    kind: "transmission",
    era: "live",
    id: "TX-VΣ03",
    date: "2026.09.06_11:45",
    title: "WEB3: THE NETWORK CONNECTION",
    tags: ["web 3.0", "network connection", "wallet", "live data"],
    content: `A new layer has been established within the VΣLOHE SYSTEM architecture.

The Aethergrid is no longer isolated.

External network protocols have been detected, mapped, and integrated into the live interface. Wallet connectivity is now active, allowing external nodes to establish a direct connection with the system.

A second signal has emerged.

Digital asset markets are now being monitored through newly integrated data channels. Selected cryptocurrency values are displayed through live market chips, synchronized with the external network and refreshed every 45 seconds.

The system is no longer simply observing digital assets.

It is now connected to the network that moves them.

Wallet interfaces. Market signals. Live values. External protocols.

All are now converging within the VΣLOHE SYSTEM.

The boundary between archive and network has begun to disappear.

WEB3 INTEGRATION: ACTIVE.
WALLET CONNECTIVITY: ESTABLISHED.
MARKET DATA CHANNEL: ONLINE.
LIVE SYNCHRONIZATION: 45s.

The connection is stable.

Awaiting further signals from the network.`,
  },
  {
    kind: "transmission",
    era: "live",
    id: "TX-VΣ02",
    date: "2026.08.09_07:11",
    title: "CHAPTER 1: THE PULSE INITIALIZATION",
    tags: ["chapter 1", "pulse initialization", "cyborgpunks", "lunarya"],
    content: `The buzz of government drones drowned out any other sound in the streets of San Salvador. Through the armored monitors of her clandestine lab, Lunarya watched the "pacification" forces deploy. They were beasts of metal and soulless algorithms, funded by a paranoid State looking to suffocate the imminent civil war. They wanted to hijack the VΣLOHE SYSTEM's core. They wanted to turn her surveillance network into an omniscient executioner.

But Lunarya was always one step ahead. Her fingers flew across the holographic keyboard, isolating her private network from the government's mainframe. On the main screen, an encrypted folder opened, harmlessly classified under the name: CyborgPunks Club. To the State's auditors, these files were nothing more than a bizarre collection of digital art—pixelated avatars, urban aesthetics, and vibrant colors. Digital trash.

What the censors didn't know was that every pixel, color palette, and geometric stroke concealed terabytes of genetic code and biomechanical assembly schematics. The CyborgPunks weren't just art; they were a dormant army. A red alert flashed on the screen. The government forces had begun their assault on the east sector. It was now or never. Lunarya knew that conventional channels would be intercepted in seconds by government algorithms. She needed an immutable path. A network that belonged to no one, and therefore, no one could shut down. She invoked the protocols of the old decentralized web, hiding the ignition sequences within smart contracts on the Ethereum and Tezos blockchains.`,
  },
  {
    kind: "transmission",
    era: "live",
    id: "TX-VΣ01",
    date: "2026.07.24_08:00",
    title: "Anomalous Pulse Detected — PROLOGUE Initialized",
    tags: ["aethergrid", "prologue", "anomaly"],
    content: `Signal registered.

Temporal coordinates set: [2045].

Anomalous pulse detected within VΣLOHE SYSTEM architecture.

Surveillance protocols intercepted by unknown variables.

Entity classification updated:
THE AETHERGRID.

Five dormant frequencies identified in the digital void.

New archive designation assigned.
PROLOGUE initialized.`,
  },

  // ─── Archives (TX-001–008) — sorted newest-first in feed.ts ───
  {
    kind: "transmission",
    era: "archive",
    id: "TX-001",
    date: "2026.01.02_10:51",
    title: "VΣLOHE SYSTEM Initialization",
    content:
      "System channel initialized. VΣLOHE SYSTEM is now online. Core modules responding within expected parameters. Node directory synchronized.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-001.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-002",
    date: "2026.01.02_10:51",
    title: "Phase Alignment Detected",
    content:
      "Phase alignment detected. Low-amplitude signal patterns identified. External timing partially synchronized. Channel resonance within acceptable variance. No direct source confirmed. Signal integrity remains unstable. System continues passive scan. Escalation protocols on standby.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-002.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-003",
    date: "2026.01.04_14:20",
    title: "CyborgPunk State 001 Minted",
    relatedNftId: "VEL-001",
    tags: ["cyborgpunks", "mint", "virex"],
    content:
      "Signal inbound. Verification confirmed. CyborgPunk State 001 successfully minted. EVO activation indexed. Calltag registered: CBPS-VS-001 // VIREX. Synchronization verified with CyborgPunk 001. Pixel node confirmed as source reference. No replacement detected. Parallel execution established. State and pixel now operate as synchronized registers. Distinct operational layers active. A new project trajectory is now running. Further transmissions pending.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-003.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-004",
    date: "2026.01.04_14:22",
    title: "CyborgPunk State 002 Minted",
    relatedNftId: "VEL-002",
    tags: ["cyborgpunks", "mint", "nulla"],
    content:
      "Signal registered. Low-visibility channel active. CyborgPunk State 002 successfully minted. EVO activation completed. Calltag registered: CBPS-VS-002 // NULLA. Synchronization verified with CyborgPunk 002. Pixel node confirmed as source reference. No direct interface engagement detected. Passive observation state enabled. State operates in silent mode. Background monitoring persistent. Parallel execution confirmed. Further analysis deferred.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-004.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-005",
    date: "2026.01.08_04:20",
    title: "CyborgPunk State 003 Minted",
    relatedNftId: "VEL-003",
    tags: ["cyborgpunks", "mint", "lynx"],
    content:
      "Signal registered. Secure channel stabilized. CyborgPunk State 003 successfully minted. EVO activation sequence completed. Calltag registered: CBPS-VS-003 // LYNX. Optical monitoring module initialized. Dedicated monocular interface online. Node supervision protocols enabled. Critical system points under observation. Defensive synchronization layers aligned. Oversight parameters within stable range. State remains active. Continuous execution confirmed.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-005.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-006",
    date: "2026.01.08_19:16",
    title: "CyborgPunk State 004 Minted",
    relatedNftId: "VEL-004",
    tags: ["cyborgpunks", "mint", "stripe"],
    content:
      "Signal registered. High-throughput channel initialized. CyborgPunk State 004 successfully minted. EVO activation confirmed. Calltag registered: CBPS-VS-004 // STRIPE. Interface runner protocols engaged. Continuous scanline filtering online. Cross-layer traversal enabled. Data transfer routes synchronized. Mobility and execution speed optimized. High-frequency operations sustained. State remains active. Rapid traversal cycle confirmed.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/tx-006.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-007",
    date: "2026.07.11_20:09",
    title: "Unknown Interface Detected",
    tags: ["lunarya", "aethergrid", "interface"],
    content:
      "Unknown interface detected. Origin outside registered subsystems. Security diagnostics completed. No hostile activity identified. Structural analysis initiated. Coherent ecosystem confirmed. Incoming transmissions intercepted. Source designation: Lunarya Studios. Interface remains unclassified. Observation protocols expanded. New archive designation assigned. THE AETHERGRID initialized. Persistent connection established. Continuous monitoring active.",
    blogLink: "https://velohesystem.blogspot.com/2026/07/tx-007.html",
  },
  {
    kind: "transmission",
    era: "archive",
    id: "TX-008",
    date: "2026.07.19_07:00",
    title: "CyborgPunk State 005 Minted",
    relatedNftId: "VEL-005",
    tags: ["cyborgpunks", "mint", "arc"],
    content:
      "Signal registered. System-wide alignment channel initialized. CyborgPunk State 005 successfully minted. EVO activation confirmed. Calltag registered: CBPS-VS-005 // ARC. System coordination protocols engaged. Stable synchronization layer established. Operational continuity maintained across active identities. Internal processing prioritized. State remains active. Aethergrid integration pending.",
    blogLink: "https://velohesystem.blogspot.com/2026/07/tx-008.html",
  },
];