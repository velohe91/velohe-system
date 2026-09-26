This repository is VΣLOHE SYSTEM — a Next.js application for the VΣLOHE digital archive, NFT exhibition, lore, transmissions, and Web3 ecosystem.

Working Branch
All agent development must be performed on:
agents
Do not modify main unless the user explicitly requests it.
Commits
Agents may create commits on agents only after the user reviews and approves the changes.
Do not commit directly to main unless explicitly requested.

General Development
Agents may freely modify and extend the application on the agents branch, including:
- Pages and routes
- React components
- TypeScript and JavaScript
- Application logic
- NFT and gallery data
- Lore and transmission content
- API routes
- New features and integrations
- Bug fixes

Prefer extending the existing architecture over unnecessary rewrites.
Before changing code:
1. Understand the existing implementation.
2. Make the smallest appropriate change.
3. Keep unrelated systems untouched.
4. Test the affected functionality.
5. Show the result to the user before committing.


Protected Systems

The following systems are protected by default and should not be modified unless the user explicitly requests it:
Web3
- Blockchain configuration
- Supported networks
- Wallet providers
- Wallet connection architecture
- Wallet-related modals
- Existing EVM / Solana / Tezos connection flows
- Existing Web3 compatibility infrastructure
This includes the existing wagmi, RainbowKit, viem, and multi-chain architecture.

Visual System
Do not modify the existing visual language unless explicitly requested.
This includes:
- CSS and styling architecture
- Colors
- Fonts
- Typography
- Existing visual effects
- Cyberpunk / holographic design language
Functional UI changes are allowed when they preserve the existing visual system.

Explicit User Requests

Protected systems are not permanently forbidden.
If the user explicitly requests a change to a protected system, follow the request while preserving existing functionality wherever possible.

Git Safety
Never rewrite history or force-push branches unless explicitly requested.
Keep changes focused and avoid unrelated modifications.