import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const CONTRACT = "0x03d29e93692f0cd22d89e59f45b166a40c34b1c1" as const;

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const ERC165_ABI = [
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const ERC721_METADATA_ABI = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const ERC1155_METADATA_ABI = [
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const CONTRACT_METADATA_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "baseURI",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "contractURI",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

async function readSafely<T>(read: () => Promise<T>) {
  try {
    return { value: await read() };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function resolveIpfsUri(uri: string, tokenId: number) {
  const hexId = tokenId.toString(16).padStart(64, "0");
  const resolved = uri.replace("{id}", hexId);

  if (!resolved.startsWith("ipfs://")) {
    return [resolved];
  }

  const path = resolved.slice("ipfs://".length);

  return [
    `https://dweb.link/ipfs/${path}`,
    `https://w3s.link/ipfs/${path}`,
    `https://ipfs.io/ipfs/${path}`,
  ];
}

async function readMetadata(uri: string, tokenId: number) {
  const urls = resolveIpfsUri(uri, tokenId);
  const errors: Array<{ url: string; error: string }> = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        errors.push({ url, error: `HTTP ${response.status}` });
        continue;
      }

      return {
        url,
        value: await response.json(),
      };
    } catch (error) {
      errors.push({
        url,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    error: "All IPFS gateways failed",
    attempts: errors,
  };
}

export async function GET() {
  const tokenResults = await Promise.all(
    [1, 2, 3, 4, 5].map(async (tokenNumber) => {
      const tokenId = BigInt(tokenNumber);

      const uriResult = await readSafely(() =>
        client.readContract({
          address: CONTRACT,
          abi: ERC1155_METADATA_ABI,
          functionName: "uri",
          args: [tokenId],
        }),
      );

      return {
        tokenId: tokenNumber,
        tokenURI: await readSafely(() =>
          client.readContract({
            address: CONTRACT,
            abi: ERC721_METADATA_ABI,
            functionName: "tokenURI",
            args: [tokenId],
          }),
        ),
        uri: uriResult,
        metadata:
          "value" in uriResult && typeof uriResult.value === "string"
            ? await readMetadata(uriResult.value, tokenNumber)
            : { error: "No URI available for metadata resolution" },
      };
    }),
  );

  const interfaces = {
    erc165: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: ERC165_ABI,
        functionName: "supportsInterface",
        args: ["0x01ffc9a7"],
      }),
    ),
    erc721: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: ERC165_ABI,
        functionName: "supportsInterface",
        args: ["0x80ac58cd"],
      }),
    ),
    erc1155: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: ERC165_ABI,
        functionName: "supportsInterface",
        args: ["0xd9b67a26"],
      }),
    ),
    erc1155MetadataUri: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: ERC165_ABI,
        functionName: "supportsInterface",
        args: ["0x0e89341c"],
      }),
    ),
  };

  const metadata = {
    name: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: CONTRACT_METADATA_ABI,
        functionName: "name",
      }),
    ),
    symbol: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: CONTRACT_METADATA_ABI,
        functionName: "symbol",
      }),
    ),
    baseURI: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: CONTRACT_METADATA_ABI,
        functionName: "baseURI",
      }),
    ),
    contractURI: await readSafely(() =>
      client.readContract({
        address: CONTRACT,
        abi: CONTRACT_METADATA_ABI,
        functionName: "contractURI",
      }),
    ),
  };

  return NextResponse.json({
    contract: CONTRACT,
    chain: "Ethereum Mainnet",
    interfaces,
    metadata,
    tokenResults,
  });
}
