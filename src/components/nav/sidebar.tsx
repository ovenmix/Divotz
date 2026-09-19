"use client";

/**
 * The sidebar layers.
 *
 * Divotz navigates in layers rather than in one flat dashboard chrome:
 *
 *   Club sidebar   - "where am I?"      (the club, always present)
 *   Admin sidebar  - "what can I do?"   (slides in beside it, on demand)
 *   Page           - "what now?"
 *
 * The second layer opens *next to* the first rather than replacing it, so
 * stepping into administration never feels like leaving the club for a
 * different product. Nothing here is a full-screen context switch.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { NavItem, NavSection } from "@/lib/navigation";
import { NavIcon } from "./icons";
import { useClub } from "@/lib/club-context";
import { joinClubPath } from "@/lib/club-path";

function isActive(pathname: string, href: string, basePath: string, match?: string): boolean {
  const target = joinClubPath(basePath, href);
  if (match === "exact") return pathname === target;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function SidebarLink({
  item,
  basePath,
  compact,
}: {
  item: NavItem;
  basePath: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, basePath, item.match);

  return (
    <Link
      href={joinClubPath(basePath, item.href)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150",
        compact ? "h-8" : "h-9",
        active
          ? // The active row uses the club's own colour, with the computed
            // foreground so it stays readable whatever the club picked.
            "bg-[var(--club-primary)] text-[var(--club-primary-foreground)] font-medium"
          : "text-ink-muted hover:bg-cream-500 hover:text-ink",
      )}
    >
      <NavIcon name={item.icon} className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
            active ? "bg-black/15" : "bg-cream-800 text-grey-500",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarSection({
  section,
  basePath,
  compact,
}: {
  section: NavSection;
  basePath: string;
  compact?: boolean;
}) {
  return (
    <div className="mb-5 last:mb-0">
      {section.title ? (
        <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-subtle">
          {section.title}
        </p>
      ) : null}
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <SidebarLink key={item.href} item={item} basePath={basePath} compact={compact} />
        ))}
      </div>
    </div>
  );
}

/**
 * A secondary layer.
 *
 * It animates, but only just: a short slide and fade so the eye registers that
 * the context changed. The goal is "context changed", not "look at this
 * animation" - and it respects reduced-motion.
 */
export function SidebarLayer({
  title,
  backHref,
  backLabel,
  sections,
  basePath,
  footer,
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  sections?: NavSection[];
  basePath: string;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <nav
      aria-label={title}
      className={cn(
        "hidden lg:flex w-56 shrink-0 flex-col border-r border-line bg-cream-100/70",
        "motion-safe:animate-[divotz-layer_140ms_ease-out]",
      )}
    >
      <div className="px-3 pt-4 pb-3">
        {backHref ? (
          <Link
            href={joinClubPath(basePath, backHref)}
            className="mb-2 inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink transition-colors"
          >
            <span aria-hidden>&larr;</span> {backLabel ?? "Back"}
          </Link>
        ) : null}
        <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-ink-muted">{title}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sections?.map((section, i) => (
          <SidebarSection key={section.title ?? i} section={section} basePath={basePath} compact />
        ))}
        {children}
      </div>
      {footer ? <div className="border-t border-line p-3">{footer}</div> : null}
    </nav>
  );
}

/** Mobile equivalent of a layer: a horizontal scroller, not a hamburger maze. */
export function SidebarLayerMobile({
  sections,
  basePath,
  label,
}: {
  sections: NavSection[];
  basePath: string;
  label: string;
}) {
  const pathname = usePathname();
  const items = sections.flatMap((section) => section.items);

  return (
    <nav aria-label={label} className="lg:hidden border-b border-line bg-cream-100/70">
      <div className="flex gap-1 overflow-x-auto px-4 py-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href, basePath, item.match);
          return (
            <Link
              key={item.href}
              href={joinClubPath(basePath, item.href)}
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
    </nav>
  );
}

export { isActive, useClub };
