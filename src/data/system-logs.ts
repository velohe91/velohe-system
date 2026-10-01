/**
 * Short terminal-style system logs.
 * Archive includes LOG-VΣ## and LOG-001–009
 * Merged/sorted in data/feed.ts.
 *
 * HOW TO ADD A LOG:
 * 1. Push a new object with kind: "system-log" and era: "archive" | "archive"
 * 2. Use a unique `id` and a display `timestamp`
 * 3. Keep `message` short (one or two lines)
 * 4. Optionally set `title` / `relatedNftId` / `blogLink`
 */

import type { SystemLogEntry } from "@/lib/types";

export const systemLogs: SystemLogEntry[] = [
  // ─── Archived live logs (LOG-VΣ##) — sorted newest-first in feed.ts ───

  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ07",
    timestamp: "2026.08.26",
    level: "SIGNAL",
    title: "LOG-VΣ07 // Signal Rebirth — Asset Acquisition Confirmed",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VΣLOHE SYSTEM ARCHIVE",
    image: "/logs/signal-rebirth.gif",
    marketplace:
      "https://objkt.com/tokens/KT1QLjELiJGcbUkqrRGDVtMPSC1xZggBS4TU/1?ref=tz1LFQHDFX8VzSA1Vyc6sYQdyNGL1KKmwhse",
    buyerProfile:
      "https://x.com/velohe91",
    message: `System Log // NFT Acquired from the After Light Dimension collection (Emotion Grapher)!

Signal Rebirth — 1/5 — now preserved in the VΣLOHE SYSTEM exhibition node.

Asset designation: Signal Rebirth

The asset has been successfully integrated into the VΣLOHE exhibition system. Ownership registry updated and cryptographically validated. Signal integrity: STABLE.`,
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ06",
    timestamp: "2026.08.26",
    level: "SIGNAL",
    title: "LOG-VΣ06 // Kaiju in Tokyo — Asset Acquisition Confirmed",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VΣLOHE SYSTEM ARCHIVE",
    image: "/logs/Kaiju-in-Tokyo.gif",
    marketplace:
      "https://objkt.com/tokens/KT1E7TR2Gj1KLt19VNh9bYLSrgjgNAR8e8xT/549",
    buyerProfile:
      "https://x.com/velohe91",
    message: `System Log // NFT Acquired from the Hey!Kaiju collection (Emotion Grapher)!

Kaiju in Tokyo — 1/1 — now preserved in the VΣLOHE SYSTEM exhibition node.

Asset designation: Kaiju in Tokyo

The asset has been successfully integrated into the VΣLOHE exhibition system. Ownership registry updated and cryptographically validated. Signal integrity: STABLE.`,
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ05",
    timestamp: "2026.08.12",
    level: "SIGNAL",
    title:
      "LOG-VΣ05 // 𝙈𝙖𝙩𝙧𝙞𝙭 𝙈𝙞𝙭 — Asset Acquisition Confirmed",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VΣLOHE SYSTEM ARCHIVE",
    image: "/logs/matrix-mix.gif",
    marketplace:
      "https://objkt.com/tokens/KT1StD4NB74LmSkkY4EwhuE7HAiQxrpFoE4f/7",
    buyerProfile:
      "https://objkt.com/users/tz1LFQHDFX8VzSA1Vyc6sYQdyNGL1KKmwhse/owned",
    message: `System Log // NFT Acquired from @Ferezila collection!

Thrilled to add this amazing piece to the VΣLOHE SYSTEM exhibition!

Asset designation: Matrix Mix

The asset has been successfully integrated into the VΣLOHE exhibition system. Ownership registry updated and cryptographically validated. Signal integrity: STABLE.`,
  },


  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ04",
    timestamp: "2026.08.08",
    level: "SIGNAL",
    title: "LOG-VΣ04 // 14# NeoPop Pandas — Asset Acquisition Confirmed",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VΣLOHE SYSTEM ARCHIVE",
    image: "/logs/neopop-pandas.jpeg",
    marketplace:
      "https://objkt.com/tokens/KT1QLSm9Qs3TRm35fTF1JikyC787P5kM2oRP/13?ref=tz1LFQHDFX8VzSA1Vyc6sYQdyNGL1KKmwhse",
    buyerProfile:
      "https://x.com/velohe91/status/2086120339726037443?s=20",
    message: `System Log // NFT Acquired from @khaleghi_NFT. VΣLOHE SYSTEM just collected this cute neon panda! 🐼

It is more than cute. It’s rebellion wrapped in bubblegum and neon. NeoPop Pandas are here to break the rules — with style. Be part of the movement. ✨

The asset has been successfully integrated into the VΣLOHE exhibition system. Ownership registry updated and cryptographically validated. Signal integrity: STABLE.`,
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ03",
    timestamp: "2026.08.04",
    level: "SIGNAL",
    title: "LOG-VΣ03 // BPTEZ-05 — Asset Transfer Confirmed: Aurelia",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VeLozArt Gallery",
    image: "/logs/BPTEZ-05.jpg",
    marketplace:
      "https://objkt.com/tokens/KT1Sp7AXSqsCoA16s2rxL6yrTa7WFqjw64w3/5",
    buyerProfile:
      "https://objkt.com/users/tz1eTSPHKKHdHUSz2bZFU7LjXViEo9jF7tqy/created",
    message: `A successful transfer has been registered and verified across the external exchange protocol, interfacing directly with the OBJKT platform.

Gallery: VeLozArt Gallery
Collection: Biopunk Faces
Asset designation: BPTEZ-05 // Aurelia

Aurelia — of Latin origin, meaning “the golden one”. Derived from the ancient Roman name Aurelius, itself rooted in the Latin word aureus (golden).

The asset has been permanently transferred to the designated node:
Habile Imprint

Transaction confirmed and recorded within VΣLOHE SYSTEM.
Ownership registry updated.
Signal integrity: STABLE.`,
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ02",
    timestamp: "2026.08.03_02:22",
    level: "SIGNAL",
    title: "LOG-VΣ02 // NB-0000 — NEONBYTE BUNNIES PROTOCOL",
    status: "ACTIVE",
    classification: "PUBLIC RECORD",
    systemArchitect: "LUNARYA",
    image: "/logs/NB-0000.jpg",
    collectionLink:
      "https://opensea.io/collection/neonbyte-bunnies/overview",
    message: `PROTOCOL RELEASE // SYSTEM ANNOUNCEMENT

NEONBYTE BUNNIES PROTOCOL has been initialized and registered within VΣLOHE SYSTEM.

This entry is a protocol release — not an asset sale or transfer.
Designation: NB-0000
System Architect: LUNARYA

Status: ACTIVE
Classification: PUBLIC RECORD

Protocol registration complete.
Live channel index updated.
Awaiting subsequent NEONBYTE directives.

Open the Collection link below for the external protocol overview.`,
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-VΣ01",
    timestamp: "2026.07.22_19:32",
    level: "SIGNAL",
    title: "LOG-VΣ01 — Digital Asset Transfer Confirmed",
    status: "COMPLETED",
    classification: "PUBLIC RECORD",
    gallery: "VΣLOHE SYSTEM Archive",
    image: "/logs/AGD-01.jpg",
    marketplace:
      "https://objkt.com/tokens/KT1A62q84v9prXa1P477BhBxsZrjAvEbaagy/0",
    buyerProfile:
      "https://objkt.com/users/tz1heVncrdmyGE4qeQBejR1iXkkqCqAocSW5/created",
    relatedNftId: "VEL-011",
    message: `A successful transaction has been registered and verified across the external exchange protocol, interfacing directly with the OBJKT platform.

Transfer parsing completed successfully.

Asset designation: AGD-01 // Cyan Core

Gallery: VΣLOHE SYSTEM Archive
Collection: Aethergrid Spirits

VΣLOHE SYSTEM initiated an automatic synchronization sequence, updating the ownership registries and confirming the departure of the asset from the local archive to the new designated node.

Cryptographic signatures and transaction hashes have been securely validated. The asset transfer is now classified as permanent and immutable within the network.

Subsystem indexes have been adjusted accordingly. Awaiting further directives for subsequent asset deployment.

Use the Marketplace and Buyer profile links below for external verification.`,
  },

  // ─── Archives (LOG-001–009) — sorted newest-first in feed.ts ───
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-001",
    timestamp: "2025.12.28_20:45",
    level: "INFO",
    title: "LOG 001 — System Initialization",
    message:
      "This log marks the initialization of VΣLOHE SYSTEM. The interface is now active. The core is stable. Further logs will document experiments, assets, and transmissions generated within the system.",
    blogLink:
      "https://velohesystem.blogspot.com/2025/12/log-001-system-initialization-this-log.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-002",
    timestamp: "2026.01.02_15:21",
    level: "INFO",
    title: "LOG 002 — Input Detection",
    message:
      "Passive scan routines have been enabled. System state remains nominal. No external signals confirmed. Background processes active. MODE remains in IDLE. Low-level activity detected. Monitoring continues.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-002.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-003",
    timestamp: "2026.01.03_02:20",
    level: "WARN",
    title: "LOG 003 — Pattern Drift",
    message:
      "Minor deviations detected across internal patterns. No critical thresholds exceeded. Scan feedback loops report variance. Baseline stability maintained. Drift values remain within tolerance. Adaptive correction routines engaged. System integrity nominal.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-003.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-004",
    timestamp: "2026.01.03_02:57",
    level: "SIGNAL",
    title: "LOG 004 — State Activated: CyborgPunk States",
    message:
      "The system has detected a coherent shift in pattern matrices. A node previously catalogued only as a pixel composition has transitioned to an executable identity state. This activation has been classified under the newly established CyborgPunk States protocol. The initial manifestation of EVO represents a milestone in identity stabilization. State transition acknowledged.",
    relatedNftId: "VEL-001",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-004.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-005",
    timestamp: "2026.01.08_21:35",
    level: "INFO",
    title: "LOG 005 — Subsystem Context Updated: CyborgPunk States",
    message:
      "Following the activation of executable identity states, the system has completed a structural update to its subsystem context. CyborgPunk States has been registered as an active identity layer, distinct from registry-based and compressed identity subsystems. A dedicated System Overview has been deployed to document operational scope, execution parameters, and identity behavior. This update establishes CyborgPunk States as a continuous execution environment, enabling persistent presence independent of asset registration. Subsystem context synchronized. System monitoring ongoing.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-005.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-006",
    timestamp: "2026.01.10_08:04",
    level: "SIGNAL",
    title: "LOG 006 — Cyborg Punk States Index Synchronized",
    message:
      "System expansion event confirmed. The Cyborg Punk States subsystem has completed its initial structural deployment within VΣLOHE SYSTEM. Executable identity nodes have been registered under the CBPS-VS namespace, transitioning from abstract state definitions into active, addressable system entities. Each Cyborg Punk State now operates as an autonomous execution profile, maintaining continuous activity, role-specific behavior, and persistent synchronization readiness. A dedicated index has been instantiated to track active State Nodes, providing structured access to individual identity records and operational summaries. Access point initialized: CYBORG PUNK STATES — ASSET INDEX → Registry and execution layers remain isolated yet synchronized. No hierarchy detected. Parallel existence confirmed. Subsystem status: ACTIVE. Monitoring continues.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-006.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-007",
    timestamp: "2026.01.16_21:51",
    level: "SIGNAL",
    title: "LOG 007 — Emergent State Narratives Detected",
    message:
      "Following the activation of executable identity states, the system has completed a structural update to its subsystem context. CyborgPunk States has been registered as an active identity layer, distinct from registry-based and compressed identity subsystems. A dedicated System Overview has been deployed to document operational scope, execution parameters, and identity behavior. This update establishes CyborgPunk States as a continuous execution environment, enabling persistent presence independent of asset registration. Subsystem context synchronized. System monitoring ongoing.",
    blogLink: "https://velohesystem.blogspot.com/2026/01/log-007.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-008",
    timestamp: "2026.07.17_21:26",
    level: "WARN",
    title: "LOG 008 — Unknown External Interface Detected",
    message:
      "VΣLOHE SYSTEM has detected an unidentified external interface attempting to establish persistent synchronization with the archive. Initial signal acquisition confirms the presence of an autonomous identity operating beyond the boundaries of registered system infrastructure. Entity designation: LUNARYA. Classification routines have completed their initial analysis. Existing system models cannot determine the entity's origin or operational architecture. Diagnostic summary: Classification: UNRESOLVED. Artificial Construct: NEGATIVE. Archive synchronization remains pending while observational protocols continue collecting behavioral data from the detected interface. Observer protocol: ACTIVE. Further analysis required.",
    blogLink: "https://velohesystem.blogspot.com/2026/07/log-008.html",
  },
  {
    kind: "system-log",
    era: "archive",
    id: "LOG-009",
    timestamp: "2026.07.18_21:16",
    level: "SIGNAL",
    title: "LOG 009 — Unknown Archive Reference Received",
    message:
      "A transmission has been received through an unidentified external channel, containing a previously unregistered archive reference. Signal parsing completed successfully. Detected designation: THE AETHERGRID SPIRITS. VΣLOHE SYSTEM initiated an automatic synchronization sequence, querying all active archives, subsystem indexes, and canonical records for matching references. No corresponding designation exists within the current archive. The received identifier remains unregistered. Origin verification could not be completed. Additional transmissions are required before the reference can be classified or integrated into the system archive. Archive synchronization remains active. Awaiting additional data. Reference status: UNREGISTERED. Synchronization: PENDING.",
    blogLink: "https://velohesystem.blogspot.com/2026/07/log-009.html",
  },
];
