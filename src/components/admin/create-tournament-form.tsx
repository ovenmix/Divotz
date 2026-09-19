"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FORMAT_LABELS } from "@/lib/domain/format";

export function CreateTournamentForm({
  action,
  slug,
  basePath,
  collectsPayment,
}: {
  action: (formData: FormData) => void;
  slug: string;
  basePath: string;
  collectsPayment: boolean;
}) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="clubSlug" value={slug} />
      <input type="hidden" name="basePath" value={basePath} />

      <Field label="Tournament name" required htmlFor="name">
        <Input id="name" name="name" required placeholder="Men's Night" autoFocus />
      </Field>

      <Field label="Description" htmlFor="description" hint="Shown on the tournament page.">
        <Textarea id="description" name="description" rows={3} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" required htmlFor="date">
          <Input id="date" name="date" type="date" required />
        </Field>
        <Field label="Tee time" htmlFor="teeTime">
          <Input id="teeTime" name="teeTime" type="time" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Format" htmlFor="format">
          <Select id="format" name="format" defaultValue="strokePlay">
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Field size" htmlFor="capacity" hint="Leave blank for no limit.">
          <Input id="capacity" name="capacity" type="number" min={1} inputMode="numeric" />
        </Field>
      </div>

      {/*
       * The entry fee question only exists for clubs that take payment. A club
       * with online payments off never sees it - and is never asked to turn
       * something off that it already turned off at the club level.
       */}
      {collectsPayment ? (
        <Field label="Entry fee" htmlFor="fee" hint="In dollars. Leave blank for a free event.">
          <Input id="fee" name="fee" type="number" min={0} step="0.01" inputMode="decimal" placeholder="25.00" />
        </Field>
      ) : null}

      <div className="flex gap-3 pt-1">
        <Button type="submit" size="lg">
          Create tournament
        </Button>
      </div>
    </form>
  );
}
