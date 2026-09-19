/**
 * What a club's branding actually resolves to at render time.
 *
 * The split matters: a logo is free for every club, while colours, typography
 * and photography are Pro. A club that had Pro and moved it elsewhere keeps its
 * stored colours - they simply stop being applied - so nothing is destroyed by
 * a transfer and everything comes back if Pro returns.
 */

import type { Club } from "./types";
import type { ClubPalette } from "../color";

export function effectivePalette(club: Club): ClubPalette {
  if (club.plan !== "pro") return {};
  return {
    primary: club.branding.primaryColor,
    secondary: club.branding.secondaryColor,
    accent: club.branding.accentColor,
  };
}

export function effectiveHeroImage(club: Club): string | null {
  // Custom photography is Pro; the shared placeholder is not.
  if (club.plan !== "pro") return null;
  return club.branding.heroImageUrl ?? null;
}

export function effectiveDisplayFont(club: Club): string | null {
  return club.plan === "pro" ? club.branding.displayFont : null;
}

/** Logo is never gated. Every club can put its own mark on its own site. */
export function clubLogo(club: Club): string | null {
  return club.branding.logoUrl;
}

export function clubIcon(club: Club): string | null {
  return club.branding.iconUrl ?? club.branding.logoUrl;
}

export function clubInitials(club: Club): string {
  return club.name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
