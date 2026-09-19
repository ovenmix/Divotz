import type { ReactNode } from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "./card";
import { SectionLabel } from "./page";

/**
 * Settings are grouped by concept and every one states its consequence.
 *
 * A wall of unlabelled switches makes people guess. "When disabled, tournaments
 * won't offer online payment" means an admin can predict what they're about to
 * change before they change it.
 */
export function SettingGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <SectionLabel>{title}</SectionLabel>
      {description ? (
        <p className="mt-1 mb-3 text-sm text-ink-muted max-w-2xl leading-relaxed">{description}</p>
      ) : (
        <div className="mb-3" />
      )}
      <Card className="divide-y divide-line">{children}</Card>
    </section>
  );
}

export function SettingRow({
  label,
  description,
  consequence,
  control,
  children,
  inheritance,
}: {
  label: ReactNode;
  description?: ReactNode;
  /** What actually changes elsewhere in the product if this is switched. */
  consequence?: ReactNode;
  control?: ReactNode;
  children?: ReactNode;
  inheritance?: ReactNode;
}) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{label}</p>
          {description ? (
            <p className="mt-1 text-[13px] text-ink-muted leading-relaxed max-w-xl">{description}</p>
          ) : null}
          {inheritance}
        </div>
        {control ? <div className="shrink-0 pt-0.5">{control}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
      {consequence ? (
        <p className="mt-3 text-[13px] text-ink-subtle leading-relaxed border-l-2 border-line pl-3">
          {consequence}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Explains why an event behaves differently from the rest of the club.
 *
 * Shown on event settings so an admin debugging "why is this one public?"
 * gets the answer in place rather than by comparing two screens.
 */
export function InheritanceNote({
  clubDefault,
  overridden,
  settingsHref,
}: {
  clubDefault: string;
  overridden: boolean;
  settingsHref?: string;
}) {
  return (
    <p
      className={cn(
        "mt-2 inline-flex flex-wrap items-center gap-1.5 text-[13px]",
        overridden ? "text-warning-800" : "text-ink-subtle",
      )}
    >
      <span>Club default: {clubDefault}.</span>
      <span className="font-medium">
        {overridden ? "This event overrides the club default." : "Inherited from the club."}
      </span>
      {settingsHref ? (
        <Link
          href={settingsHref}
          className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-ink"
        >
          Club settings
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      ) : null}
    </p>
  );
}

/**
 * Pro previews live on the Pro page and nowhere else.
 *
 * The rule from the product spec: show people what Pro does in one dedicated
 * place. Do not scatter locked controls through the app that a free club has
 * to walk past every day.
 */
export function ProPreview({
  title,
  description,
  preview,
  available,
  children,
}: {
  title: string;
  description: string;
  preview?: ReactNode;
  available: boolean;
  children?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-muted leading-relaxed max-w-xl">{description}</p>
      </div>
      {preview ? <div className="border-y border-line bg-cream-500/50 p-5">{preview}</div> : null}
      <div className="p-5">
        {available ? (
          children
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Lock className="size-4" aria-hidden />
            Available with Pro
          </p>
        )}
      </div>
    </Card>
  );
}
