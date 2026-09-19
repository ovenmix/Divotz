"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useClub } from "@/lib/club-context";
import { joinClubPath } from "@/lib/club-path";
import type { NavItem } from "@/lib/navigation";
import { ClubMark } from "@/components/club/club-mark";

/** The club sidebar, folded down for small screens. */
export function ClubTopbar({
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
  const all = [...items, ...myGolf];

  return (
    <header className="lg:hidden border-b border-line bg-surface-raised">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={joinClubPath(basePath, "/")} className="flex items-center gap-2.5 min-w-0">
          <ClubMark club={club} size={30} />
          <span className="truncate text-sm font-semibold text-ink">{club.name}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {showAdmin ? (
            <Link
              href={joinClubPath(basePath, "/admin")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-muted hover:bg-cream-500"
            >
              <ShieldCheck className="size-4" aria-hidden />
              Admin
            </Link>
          ) : null}
          {!user ? (
            <Link
              href={joinClubPath(basePath, "/sign-in")}
              className="rounded-lg px-2 py-1.5 text-[13px] text-ink-muted hover:bg-cream-500"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-2">
        {all.map((item) => {
          const target = joinClubPath(basePath, item.href);
          const active = item.match === "exact" ? pathname === target : pathname.startsWith(target);
          return (
            <Link
              key={item.href}
              href={target}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-[var(--club-primary)] text-[var(--club-primary-foreground)] font-medium"
                  : "text-ink-muted hover:bg-cream-500",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
