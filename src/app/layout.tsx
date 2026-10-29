import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ImmersiveShell } from "@/components/layout/ImmersiveShell";
import { Web3Providers } from "@/components/web3/Web3Providers";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} · ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "VΣLOHE SYSTEM — an immersive cyberpunk NFT exhibition archive with lore, transmissions, and holographic gallery experiences.",
  keywords: ["NFT", "exhibition", "cyberpunk", "VΣLOHE", "archive"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-mono antialiased"
      >
        <Web3Providers>
          <ImmersiveShell>{children}</ImmersiveShell>
        </Web3Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
