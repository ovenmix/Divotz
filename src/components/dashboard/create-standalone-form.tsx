"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FORMAT_LABELS } from "@/lib/domain/format";

export function CreateStandaloneForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="space-y-5">
      <Field label="Tournament name" required htmlFor="name">
        <Input id="name" name="name" required autoFocus placeholder="Birdies for the Hospital" />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" required htmlFor="date">
          <Input id="date" name="date" type="date" required />
        </Field>
        <Field label="Format" htmlFor="format">
          <Select id="format" name="format" defaultValue="scramble">
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Field size" htmlFor="capacity" hint="Leave blank for no limit.">
          <Input id="capacity" name="capacity" type="number" min={1} />
        </Field>
        <Field label="Entry fee" htmlFor="fee" hint="In dollars. Leave blank for a free event.">
          <Input id="fee" name="fee" type="number" min={0} step="0.01" placeholder="125.00" />
        </Field>
      </div>
      <Button type="submit" size="lg">
        Create tournament
      </Button>
    </form>
  );
}
