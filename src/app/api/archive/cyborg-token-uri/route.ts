import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const CONTRACT = "0x03d29e93692f0cd22d89e59f45b166a40c34b1c1" as const;

const ABI = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function GET() {
  const results = await Promise.all(
    [1n, 2n, 3n, 4n, 5n].map(async (tokenId) => {
      try {
        const tokenURI = await client.readContract({
          address: CONTRACT,
          abi: ABI,
          functionName: "tokenURI",
          args: [tokenId],
        });

        return {
          tokenId: tokenId.toString(),
          tokenURI,
        };
      } catch (error) {
        return {
          tokenId: tokenId.toString(),
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  return NextResponse.json({
    contract: CONTRACT,
    chain: "Ethereum Mainnet",
    results,
  });
}
