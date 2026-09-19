import { StatusPill } from "@/components/ui/status";

/**
 * Shows a resolved setting and whether it departs from the club.
 *
 * An override is marked, not hidden - the point is that someone debugging
 * "why is this event public when we're a members-only club?" gets the answer
 * on the same line as the value.
 */
export function EventOverrideControl({
  current,
  overridden,
}: {
  current: string;
  overridden: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-sm font-medium text-ink">{current}</span>
      {overridden ? <StatusPill tone="warning">Override</StatusPill> : null}
    </span>
  );
}
