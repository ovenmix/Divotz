"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CreateClubForm({
  action,
  rootDomain,
}: {
  action: (formData: FormData) => void;
  rootDomain: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);

  const effectiveSlug = touched ? slug : slugify(name);

  return (
    <form action={action} className="space-y-5">
      <Field label="Club name" required htmlFor="club-name">
        <Input
          id="club-name"
          name="name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Gleniffer Golf"
        />
      </Field>

      {/* The address is shown as it will actually read, while they type it. */}
      <Field
        label="Club address"
        required
        htmlFor="club-slug"
        hint="This is the address golfers will bookmark. It's the front door to your club."
      >
        <div className="flex items-center gap-0">
          <Input
            id="club-slug"
            name="slug"
            required
            value={effectiveSlug}
            onChange={(e) => {
              setTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="rounded-r-none"
          />
          <span className="flex h-10 items-center rounded-r-lg border border-l-0 border-line-strong/50 bg-cream-500 px-3 text-sm text-ink-muted">
            .{rootDomain}
          </span>
        </div>
      </Field>

      <Field label="Where you are" htmlFor="club-location">
        <Input id="club-location" name="location" placeholder="Spruce View, Alberta" />
      </Field>

      <Field label="A line about the club" htmlFor="club-description">
        <Textarea id="club-description" name="description" rows={3} />
      </Field>

      <Button type="submit" size="lg">
        Create club
      </Button>
    </form>
  );
}
