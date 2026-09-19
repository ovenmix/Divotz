"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

/**
 * Club deletion.
 *
 * Hard to do by accident on purpose: it's tucked away from ordinary settings,
 * it opens closed, it spells out what goes, and the confirm button stays dead
 * until the club's name is typed exactly. A real implementation also
 * re-authenticates before the destructive call - the hook for that is where
 * `onConfirm` would go.
 */
export function DeleteClub({ clubName, clubSlug }: { clubName: string; clubSlug: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const matches = typed.trim() === clubName;

  if (!open) {
    return (
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete this club</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Permanently removes {clubName} and everything in it.
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Delete club
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-danger-500/30">
      <CardBody className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-ink">Delete {clubName}?</p>
          <p className="mt-1.5 text-[13px] text-ink-muted leading-relaxed">
            This removes the club&apos;s site at {clubSlug}, every tournament and league, all
            registrations and scores, the membership list and all payment records. Members and
            staff lose access straight away. It cannot be undone.
          </p>
        </div>

        <Field
          label={`Type ${clubName} to confirm`}
          htmlFor="confirm-name"
          hint="Exactly as written above."
        >
          <Input
            id="confirm-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="max-w-sm"
          />
        </Field>

        <p className="text-[13px] text-ink-muted">
          You&apos;ll be asked to confirm your password before this goes through.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setTyped("");
            }}
          >
            Keep the club
          </Button>
          <Button variant="danger" disabled={!matches}>
            Permanently delete {clubName}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
