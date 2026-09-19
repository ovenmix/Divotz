"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/form";
import { contrastRatio, foregroundFor, parseHex } from "@/lib/color";

/**
 * Colour pickers that show their own consequence.
 *
 * As soon as a colour is chosen, the preview renders a real button in it with
 * the foreground Divotz computed - so a club that picks a very pale yellow can
 * see immediately that it gets dark text, not white text on white.
 */
export function ColorFields({
  primary,
  secondary,
  accent,
}: {
  primary: string | null;
  secondary: string | null;
  accent: string | null;
}) {
  return (
    <div className="space-y-5">
      <ColorField name="primaryColor" label="Primary" defaultValue={primary ?? "#5E765A"} />
      <ColorField name="secondaryColor" label="Secondary" defaultValue={secondary ?? "#6F8E9E"} />
      <ColorField name="accentColor" label="Accent" defaultValue={accent ?? "#D6C19B"} />
    </div>
  );
}

function ColorField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const rgb = parseHex(value);
  const foreground = foregroundFor(value);
  // Reported honestly: a club is allowed to pick a colour that needs dark text.
  const ratio = rgb ? contrastRatio(rgb, parseHex(foreground)!) : 0;

  return (
    <Field label={label} htmlFor={name}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${label} colour picker`}
          className="size-10 shrink-0 cursor-pointer rounded-lg border border-line-strong/40 bg-transparent p-1"
        />
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 font-mono uppercase"
        />
        <span
          style={{ backgroundColor: value, color: foreground }}
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium"
        >
          Register
        </span>
        <span className="text-[13px] text-ink-muted tabular-nums">
          {foreground === "#FCFBF7" ? "Light text" : "Dark text"} · {ratio.toFixed(1)}:1
        </span>
      </div>
    </Field>
  );
}
