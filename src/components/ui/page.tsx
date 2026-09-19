import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumbs carry the hierarchy the sidebars only hint at, so a user who
 * landed on a deep bookmarked URL still knows where they are.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5 text-ink-subtle" aria-hidden /> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted mb-1">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm text-ink-muted max-w-2xl leading-relaxed">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function EmptyState({
  headline,
  body,
  action,
  icon: Icon,
}: {
  headline: string;
  body: string;
  action?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong/50 bg-cream-100/60 px-6 py-12 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--club-primary-soft)]">
          <Icon className="size-6 text-[var(--club-primary-readable)]" />
        </div>
      ) : null}
      <p className="text-base font-semibold text-ink">{headline}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-muted leading-relaxed">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
