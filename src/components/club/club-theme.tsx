import type { ReactNode } from "react";
import { themeStyle } from "@/lib/color";
import { effectiveDisplayFont, effectivePalette } from "@/lib/domain/branding";
import type { Club } from "@/lib/domain/types";

/**
 * Applies a club's theme to everything inside it.
 *
 * Writes the --club-* custom properties, each with a foreground we computed
 * from the colour's actual luminance. That is what lets a club pick near-black
 * or near-white and get readable buttons either way, without a single
 * hardcoded text colour downstream.
 *
 * Divotz's own semantic colours - success, warning, error - are untouched. A
 * club whose brand is red does not get red success states.
 */
export function ClubTheme({ club, children }: { club: Club; children: ReactNode }) {
  const style = themeStyle(effectivePalette(club));
  const font = effectiveDisplayFont(club);

  return (
    <div
      style={font ? { ...style, ["--font-club-display" as string]: font } : style}
      className="contents"
    >
      {children}
    </div>
  );
}
