import Link from "next/link";

/** Small nav crumb back to the gallery hub. */
export function GalleryBackLink() {
  return (
    <Link
      href="/gallery/archive"
      className="mb-6 inline-flex font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-neon-cyan"
    >
      ← Archive
    </Link>
  );
}
