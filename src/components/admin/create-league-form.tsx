"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CreateLeagueForm({
  action,
  slug,
  basePath,
}: {
  action: (formData: FormData) => void;
  slug: string;
  basePath: string;
}) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="clubSlug" value={slug} />
      <input type="hidden" name="basePath" value={basePath} />

      <Field label="League name" required htmlFor="name">
        <Input id="name" name="name" required placeholder="Men's League" autoFocus />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} />
      </Field>
      <Field label="Night" htmlFor="dayOfWeek">
        <Select id="dayOfWeek" name="dayOfWeek" defaultValue="Thursday">
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First week" required htmlFor="startsOn">
          <Input id="startsOn" name="startsOn" type="date" required />
        </Field>
        <Field label="Last week" required htmlFor="endsOn">
          <Input id="endsOn" name="endsOn" type="date" required />
        </Field>
      </div>
      <Button type="submit" size="lg">
        Create league
      </Button>
    </form>
  );
}
