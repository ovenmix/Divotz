import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The content column of a club page.
 *
 * Divotz is credited once, quietly, at the bottom. On a Pro club with a custom
 * domain that line is the only trace of the platform on the page - which is
 * the intent: this is the club's site, not a Divotz screen with a club's name
 * printed on it.
 */
export function ClubShell({
  children,
  className,
  wide,
  bleed,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  /** Skip the padding, for pages that open with a full-width hero. */
  bleed?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <main className={cn("flex-1", bleed ? "" : "px-5 py-7 lg:px-10 lg:py-10")}>
        {/*
         * A bleed page runs edge to edge - its hero is meant to reach the
         * window, and the sections inside it centre themselves. Clamping the
         * wrapper here would strand the hero in a column.
         */}
        {bleed ? (
          <div className={className}>{children}</div>
        ) : (
          <div className={cn("mx-auto", wide ? "max-w-6xl" : "max-w-5xl", className)}>{children}</div>
        )}
      </main>
      <ClubFooter />
    </div>
  );
}

export function ClubFooter() {
  return (
    <footer className="border-t border-line px-5 py-5 lg:px-10">
      <p className="text-[12px] text-ink-subtle">
        Powered by{" "}
        <Link href="/" className="hover:text-ink-muted underline underline-offset-2">
          Divotz
        </Link>
      </p>
    </footer>
  );
}
