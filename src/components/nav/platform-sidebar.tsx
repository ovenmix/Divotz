"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavSection } from "@/lib/navigation";
import { DivotzMark } from "@/components/brand/divotz-mark";
import { NavIcon } from "./icons";

/**
 * The platform sidebar.
 *
 * Small by design. This is where you keep track of what you own or belong to -
 * not where you run a club. The moment you step into a club, this shell is
 * left behind entirely.
 */
export function PlatformSidebar({
  sections,
  user,
}: {
  sections: NavSection[];
  user: { name: string; email: string } | null;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Divotz"
      className="hidden lg:flex w-56 shrink-0 flex-col border-r border-line bg-surface-raised"
    >
      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-4">
        <DivotzMark size={28} />
        <span className="text-sm font-semibold tracking-tight text-ink">Divotz</span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section, i) => (
          <div key={section.title ?? i} className="mb-5 last:mb-0">
            {section.title ? (
              <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-subtle">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.match === "exact" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                      active
                        ? "bg-green-500 text-cream-100 font-medium"
                        : "text-ink-muted hover:bg-cream-500 hover:text-ink",
                    )}
                  >
                    <NavIcon name={item.icon} className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <div className="border-t border-line p-3">
          <Link
            href="/dashboard/account"
            className="block rounded-lg px-2.5 py-2 hover:bg-cream-500 transition-colors"
          >
            <span className="block truncate text-[13px] font-medium text-ink">{user.name}</span>
            <span className="block truncate text-[12px] text-ink-muted">{user.email}</span>
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
