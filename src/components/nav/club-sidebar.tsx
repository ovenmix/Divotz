"use client";

/**
 * The club sidebar - the first layer, and the club's own front door.
 *
 * It leads with the club's logo and name, not with Divotz. A golfer who
 * bookmarked gleniffer-golf.divotz.ca should see their club here, and should
 * never have to understand that a platform sits underneath it.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogIn, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useClub } from "@/lib/club-context";
import { joinClubPath } from "@/lib/club-path";
import type { NavItem } from "@/lib/navigation";
import { SidebarLink } from "./sidebar";
import { ClubMark } from "@/components/club/club-mark";

export function ClubSidebar({
  items,
  myGolf,
  showAdmin,
  user,
}: {
  items: NavItem[];
  myGolf: NavItem[];
  showAdmin: boolean;
  user: { name: string } | null;
}) {
  const { club, basePath } = useClub();
  const pathname = usePathname();
  // Lit whenever the admin layer is open, so the first sidebar keeps showing
  // where you came from while the second one is doing the work.
  const adminActive = pathname.startsWith(joinClubPath(basePath, "/admin"));

  return (
    <nav
      aria-label={`${club.name} navigation`}
      className="hidden lg:flex w-60 shrink-0 flex-col border-r border-line bg-surface-raised"
    >
      <Link
        href={joinClubPath(basePath, "/")}
        className="flex items-center gap-3 px-4 py-4 hover:bg-cream-500/60 transition-colors"
      >
        <ClubMark club={club} size={36} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{club.name}</span>
          {club.location ? (
            <span className="block truncate text-[12px] text-ink-muted">{club.location}</span>
          ) : null}
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          {items.map((item) => (
            <SidebarLink key={item.href} item={item} basePath={basePath} />
          ))}
        </div>

        {myGolf.length > 0 ? (
          <div className="mt-5 space-y-0.5 border-t border-line pt-4">
            {myGolf.map((item) => (
              <SidebarLink key={item.href} item={item} basePath={basePath} />
            ))}
          </div>
        ) : null}

        {/*
         * Admin is a doorway, not a different product. Clicking it opens the
         * second sidebar beside this one - this row stays put and stays lit.
         */}
        {showAdmin ? (
          <div className="mt-5 border-t border-line pt-4">
            <Link
              href={joinClubPath(basePath, "/admin")}
              aria-current={adminActive ? "true" : undefined}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                adminActive
                  ? "bg-cream-500 text-ink font-medium"
                  : "text-ink-muted hover:bg-cream-500 hover:text-ink",
              )}
            >
              <ShieldCheck className="size-4 shrink-0" aria-hidden />
              Admin
              <ChevronRight
                className={cn(
                  "ml-auto size-4 transition-transform duration-150",
                  adminActive && "translate-x-0.5",
                )}
                aria-hidden
              />
            </Link>
          </div>
        ) : null}
      </div>

      <div className="border-t border-line p-3">
        {user ? (
          <Link
            href={joinClubPath(basePath, "/my-golf")}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-cream-500 transition-colors"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--club-primary-soft)] text-[12px] font-semibold text-[var(--club-primary-readable)]">
              {initials(user.name)}
            </span>
            <span className="truncate text-[13px] text-ink">{user.name}</span>
          </Link>
        ) : (
          <Link
            href={joinClubPath(basePath, "/sign-in")}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-muted hover:bg-cream-500 hover:text-ink transition-colors"
          >
            <LogIn className="size-4" aria-hidden />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
