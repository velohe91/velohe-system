const CONTRACT = "0x407ccb1e09eb93525c2a5d12aeb1a46da135d737";
const OPEN_SEA_API_URL =
  "https://api.opensea.io/api/v2/chain/ethereum/contract";

async function getContractPreview() {
  const apiKey = process.env.OPENSEA_API_KEY;
  if (!apiKey) return { error: "missing api key" };

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

  if (!response.ok) {
    return { error: `OpenSea ${response.status}` };
  }

  const payload = await response.json();
  return {
    count: payload.nfts?.length ?? 0,
    nfts: (payload.nfts ?? []).map((nft: any) => ({
      identifier: nft.identifier,
      name: nft.name,
      description: nft.description,
      image_url: nft.image_url,
      animation_url: nft.animation_url,
      original_animation_url: nft.original_animation_url,
      opensea_url: nft.opensea_url,
      traits: nft.traits,
    })),
  };
}

export default async function ArchiveContractInspectPage() {
  const data = await getContractPreview();
  console.log("[ARCHIVE CONTRACT INSPECT]", JSON.stringify(data));

  return (
    <main style={{ padding: 40, fontFamily: "monospace" }}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
