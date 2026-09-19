import Image from "next/image";
import { clubThemeTokens } from "@/lib/color";
import { effectivePalette } from "@/lib/domain/branding";
import type { Club } from "@/lib/domain/types";

/**
 * Previews for the Pro page.
 *
 * Showing what the thing does beats describing it, and a preview on a page a
 * club visits on purpose is very different from a locked control sitting in
 * their way every day.
 */

export function ColorPreview({ club }: { club: Club }) {
  const stored = {
    primary: club.branding.primaryColor,
    secondary: club.branding.secondaryColor,
    accent: club.branding.accentColor,
  };
  // Show the club's stored colours even on Free - it's a preview of their own
  // club, which is far more persuasive than a generic swatch.
  const tokens = clubThemeTokens(
    stored.primary ? stored : effectivePalette({ ...club, plan: "pro" }),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["--club-primary", "--club-secondary", "--club-accent"] as const).map((token) => (
        <span
          key={token}
          style={{
            backgroundColor: tokens[token],
            color: tokens[`${token}-foreground` as keyof typeof tokens],
          }}
          className="inline-flex h-9 items-center rounded-lg px-3.5 text-[13px] font-medium"
        >
          {token.replace("--club-", "")}
        </span>
      ))}
    </div>
  );
}

export function FontPreview() {
  return (
    <div className="space-y-1">
      <p className="text-xl font-semibold text-ink" style={{ fontFamily: "Georgia, serif" }}>
        Men&apos;s Night
      </p>
      <p className="text-[13px] text-ink-muted">Thursday · 5:30 PM · Stableford</p>
    </div>
  );
}

export function PhotoPreview() {
  return (
    <div className="relative aspect-[21/7] overflow-hidden rounded-lg border border-line">
      <Image
        src="/images/club-hero-placeholder.jpg"
        alt="Example club hero photograph"
        fill
        sizes="400px"
        className="object-cover"
      />
    </div>
  );
}
