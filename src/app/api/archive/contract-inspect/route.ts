import { NextResponse } from "next/server";

const CONTRACT = "0x407ccb1e09eb93525c2a5d12aeb1a46da135d737";
const OPEN_SEA_API_URL =
  "https://api.opensea.io/api/v2/chain/ethereum/contract";

export async function GET() {
  const apiKey = process.env.OPENSEA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENSEA_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `${OPEN_SEA_API_URL}/${CONTRACT}/nfts?limit=20`,
    {
      headers: {
        Accept: "application/json",
        "X-API-KEY": apiKey,
      },
      cache: "no-store",
    },
  );

  const body = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { status: response.status, body },
      { status: response.status },
    );
  }

  return NextResponse.json(JSON.parse(body));
}
