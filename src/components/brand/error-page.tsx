import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { DivotzMark } from "./divotz-mark";

/**
 * Every error in Divotz has the same four parts:
 *
 *   1. a friendly headline, large
 *   2. a plain explanation of what happened
 *   3. something to actually do about it
 *   4. a small technical reference for support
 *
 * The joke is never allowed to replace the explanation, and the technical
 * detail is never allowed to outrank either. A golfer sees the human bit; the
 * pro shop can read the reference down the phone to support.
 */
export function ErrorPage({
  code,
  headline,
  explanation,
  reference,
  technical,
  actionHref = "/",
  actionLabel = "Back to the clubhouse",
  secondary,
}: {
  code?: string;
  headline: string;
  explanation: string;
  reference?: string;
  /** The real error name. Visually secondary, on purpose. */
  technical?: string;
  actionHref?: string;
  actionLabel?: string;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <DivotzMark size={40} className="mx-auto" />

        {code ? (
          <p className="mt-8 text-5xl font-semibold tracking-tight text-ink tabular-nums">{code}</p>
        ) : null}

        <h1 className="mt-4 text-2xl font-semibold text-ink lg:text-3xl">{headline}</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
          {explanation}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href={actionHref} size="lg">
            {actionLabel}
          </ButtonLink>
          {secondary}
        </div>

        {reference || technical ? (
          <div className="mt-10 border-t border-line pt-5">
            {reference ? (
              <p className="text-[12px] text-ink-subtle tabular-nums">Error ID: {reference}</p>
            ) : null}
            {technical ? (
              <p className="mt-1 font-mono text-[12px] text-ink-subtle break-words">{technical}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
