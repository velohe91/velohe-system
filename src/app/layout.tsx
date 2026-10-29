import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ImmersiveShell } from "@/components/layout/ImmersiveShell";
import { Web3Providers } from "@/components/web3/Web3Providers";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  // Include SemiBold (600) for the home wordmark
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const shareTech = Share_Tech_Mono({
  variable: "--font-share-tech",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

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
        className={`${orbitron.variable} ${shareTech.variable} font-mono antialiased`}
      >
        <Web3Providers>
          <ImmersiveShell>{children}</ImmersiveShell>
        </Web3Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
