import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Info, XCircle } from "lucide-react";

/*
 * Status is never carried by colour alone.
 *
 * Every pill renders a word, and the ones that mean something (good / bad /
 * needs attention) also render a shape. A member's status reads "Expired" to a
 * colourblind user, a screen-reader user and a printed-out roster alike.
 */

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "quiet";

const TONES: Record<Tone, string> = {
  neutral: "bg-cream-500 text-grey-500 border-cream-800",
  success: "bg-success-100 text-success-800 border-success-500/25",
  warning: "bg-warning-100 text-warning-800 border-warning-500/30",
  danger: "bg-danger-100 text-danger-800 border-danger-500/25",
  info: "bg-blue-100 text-blue-800 border-blue-500/25",
  quiet: "bg-transparent text-ink-muted border-line",
};

const ICONS: Partial<Record<Tone, typeof Info>> = {
  success: CheckCircle2,
  warning: Clock,
  danger: XCircle,
  info: Info,
  quiet: CircleDashed,
};

export function StatusPill({
  children,
  tone = "neutral",
  icon = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: boolean;
  className?: string;
}) {
  const Icon = icon ? ICONS[tone] : undefined;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[12px] font-medium leading-5 whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
      {children}
    </span>
  );
}

/** A plain label chip - for tags like "Member" that carry no health signal. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-[var(--club-primary-soft)] px-2 py-0.5",
        "text-[12px] font-medium text-[var(--club-primary-readable)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: Extract<Tone, "info" | "warning" | "danger" | "success">;
  title?: ReactNode;
  children: ReactNode;
}) {
  const Icon = tone === "info" ? Info : tone === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", TONES[tone])}>
      <Icon className="size-5 shrink-0 mt-0.5" aria-hidden />
      <div className="text-sm leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}
