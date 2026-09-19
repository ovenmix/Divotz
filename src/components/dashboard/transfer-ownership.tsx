"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Field } from "@/components/ui/form";
import { Callout } from "@/components/ui/status";

/**
 * Ownership transfer.
 *
 * Not a dropdown you change and walk away from. The confirmation spells out
 * who is giving up what, what the new owner gains, what happens to the current
 * owner's own access, and what becomes of Pro - because every one of those is
 * something people get wrong when it isn't said out loud.
 */
export function TransferOwnership({
  clubName,
  currentOwner,
  candidates,
  isPro,
  proClubCount,
}: {
  clubName: string;
  currentOwner: string;
  candidates: { id: string; name: string; email: string }[];
  isPro: boolean;
  proClubCount: number;
}) {
  const [selected, setSelected] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const newOwner = candidates.find((c) => c.id === selected);

  if (done && newOwner) {
    return (
      <Callout tone="success" title="Ownership transferred">
        {newOwner.name} now owns {clubName}. You remain a club manager and can still run events.
      </Callout>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-muted leading-relaxed">
            Ownership can only be passed to someone who already has access to {clubName}. Add them
            as staff inside the club first, then come back here.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <Field
          label="New owner"
          htmlFor="new-owner"
          hint="Anyone who's already staff at this club."
        >
          <Select
            id="new-owner"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setConfirming(false);
            }}
            className="max-w-sm"
          >
            <option value="">Choose someone</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} — {candidate.email}
              </option>
            ))}
          </Select>
        </Field>

        {newOwner && !confirming ? (
          <Button onClick={() => setConfirming(true)} variant="outline">
            Review transfer
          </Button>
        ) : null}

        {newOwner && confirming ? (
          <div className="rounded-xl border border-warning-500/30 bg-warning-100/60 p-5">
            <p className="text-sm font-semibold text-ink">
              Transfer {clubName} to {newOwner.name}?
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-lg bg-surface-raised px-3 py-1.5">
                {currentOwner} <span className="text-ink-muted">(owner)</span>
              </span>
              <ArrowRight className="size-4 text-ink-muted" aria-hidden />
              <span className="rounded-lg bg-surface-raised px-3 py-1.5">{newOwner.name}</span>
            </div>

            <ul className="mt-4 space-y-2 text-[13px] text-ink-muted leading-relaxed">
              <li>
                <strong className="text-ink">{newOwner.name}</strong> gets full control, including
                the ability to delete the club and to remove you.
              </li>
              <li>
                <strong className="text-ink">You</strong> stay on as a club manager. You keep
                everything except ownership operations.
              </li>
              <li>
                {isPro ? (
                  <>
                    <strong className="text-ink">Pro stays with your subscription</strong>, not with
                    the club. {clubName} keeps Pro while it&apos;s one of your{" "}
                    {proClubCount === 1 ? "Pro club" : `${proClubCount} Pro clubs`} - move Pro
                    elsewhere and this club falls back to the free plan, keeping its colours stored
                    for if it ever returns.
                  </>
                ) : (
                  <>
                    <strong className="text-ink">This club is on the free plan</strong>, so nothing
                    about Pro changes.
                  </>
                )}
              </li>
              <li>Members, events, registrations and payment records are untouched.</li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDone(true)}>Transfer ownership</Button>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
