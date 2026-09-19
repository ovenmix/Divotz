import Image from "next/image";
import { clubInitials, clubLogo } from "@/lib/domain/branding";
import type { Club } from "@/lib/domain/types";
import { cn } from "@/lib/cn";

/**
 * The club's mark.
 *
 * Uses the club's uploaded logo when there is one - free clubs included - and
 * otherwise draws a monogram in the club's colour. A club without a logo still
 * looks like itself rather than like a missing image.
 */
export function ClubMark({
  club,
  size = 32,
  className,
}: {
  club: Club;
  size?: number;
  className?: string;
}) {
  const logo = clubLogo(club);

  if (logo) {
    return (
      <Image
        src={logo}
        alt={`${club.name} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-lg object-contain", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-semibold",
        "bg-[var(--club-primary)] text-[var(--club-primary-foreground)]",
        className,
      )}
    >
      {clubInitials(club)}
    </span>
  );
}
