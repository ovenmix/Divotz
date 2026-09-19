"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Callout, StatusPill } from "@/components/ui/status";

/**
 * Moving Pro between clubs.
 *
 * Nothing moves until the consequence has been stated plainly: which club
 * loses its customization, which one gains it, and when the next move is
 * allowed. The cooldown is shown as a number of days rather than a policy
 * sentence, because "27 days" is what somebody actually needs to know.
 */
export function ProClubPicker({
  clubs,
  proClubIds,
  maxProClubs,
  cooldownDaysLeft,
}: {
  clubs: { id: string; name: string; slug: string }[];
  proClubIds: string[];
  maxProClubs: number;
  cooldownDaysLeft: number;
}) {
  const [current, setCurrent] = useState(proClubIds);
  const [pending, setPending] = useState<{ from?: string; to: string } | null>(null);
  const [moved, setMoved] = useState(false);

  const locked = cooldownDaysLeft > 0;
  const name = (id: string) => clubs.find((c) => c.id === id)?.name ?? "this club";

  function propose(clubId: string) {
    if (current.includes(clubId)) return;
    // Under the limit: Pro can simply be added, nothing is displaced.
    if (current.length < maxProClubs) {
      setPending({ to: clubId });
      return;
    }
    // At the limit: something has to give, and we say which.
    setPending({ from: current[0], to: clubId });
  }

  function confirm() {
    if (!pending) return;
    setCurrent((previous) => {
      const next = pending.from ? previous.filter((id) => id !== pending.from) : [...previous];
      return [...next, pending.to];
    });
    setPending(null);
    setMoved(true);
  }

  return (
    <div className="space-y-4">
      {locked && !moved ? (
        <Callout tone="info" title="Pro was moved recently">
          You can move Pro again in {cooldownDaysLeft} {cooldownDaysLeft === 1 ? "day" : "days"}.
        </Callout>
      ) : null}

      {moved ? (
        <Callout tone="success" title="Pro moved">
          The change is live. You can move Pro again in 30 days.
        </Callout>
      ) : null}

      <Card>
        <ul className="divide-y divide-line">
          {clubs.map((club) => {
            const isPro = current.includes(club.id);
            return (
              <li key={club.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span
                  aria-hidden
                  className={
                    isPro
                      ? "flex size-5 items-center justify-center rounded-full bg-[var(--club-primary)] text-[var(--club-primary-foreground)] text-[11px]"
                      : "size-5 rounded-full border border-line-strong/50"
                  }
                >
                  {isPro ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{club.name}</span>
                  <span className="block text-[13px] text-ink-muted">
                    {isPro ? "Full customization" : "Free plan"}
                  </span>
                </span>
                {isPro ? (
                  <StatusPill tone="success">Pro</StatusPill>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={locked || moved}
                    onClick={() => propose(club.id)}
                  >
                    Move Pro here
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {pending ? (
        <div className="rounded-xl border border-warning-500/30 bg-warning-100/60 p-5">
          <p className="text-sm font-semibold text-ink">Move Pro to another club?</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-ink-muted">
            {pending.from ? (
              <li>
                <strong className="text-ink">{name(pending.from)}</strong> will lose Pro
                customization. Its colours and typography stay saved, but stop being applied.
              </li>
            ) : null}
            <li>
              <strong className="text-ink">{name(pending.to)}</strong> will become Pro.
            </li>
            <li>You can move Pro again in 30 days.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Move Pro</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
