import type { Metadata } from "next";
import PixelStudioEditor from "./PixelStudioEditor";

export const metadata: Metadata = {
  title: "Panim Pixel Studio — VΣLOHE SYSTEM",
  description: "A local-first pixel art and animation studio for creators.",
};

export default function PixelLabPage() {
  return <PixelStudioEditor />;
}
