/*
 * TagPill — Clickable tag that navigates to the tag detail page
 * Bauhaus: monospaced, geometric, minimal
 */

import { Link } from "wouter";

interface TagPillProps {
  tag: string;
  active?: boolean;
  className?: string;
}

export default function TagPill({ tag, active = false, className = "" }: TagPillProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className={`tag-pill inline-block transition-all hover:!bg-[oklch(0.12_0_0)] hover:!text-[oklch(0.98_0.005_90)] hover:!border-[oklch(0.12_0_0)] ${
        active ? '!bg-[oklch(0.12_0_0)] !text-[oklch(0.98_0.005_90)] !border-[oklch(0.12_0_0)]' : ''
      } ${className}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {tag}
    </Link>
  );
}
