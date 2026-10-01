import Link from "next/link";

/** Small nav crumb back to the gallery hub. */
type GalleryBackLinkProps = {
  href?: string;
  label?: string;
};

export function GalleryBackLink({
  href = "/gallery",
  label = "All galleries",
}: GalleryBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-neon-cyan"
    >
      ← {label}
    </Link>
  );
}
