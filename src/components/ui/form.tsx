"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  required,
  children,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-danger-500 ml-0.5">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[13px] text-ink-muted leading-relaxed">{hint}</p> : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-lg border border-line-strong/50 bg-surface-raised px-3 py-2 text-sm text-ink " +
  "placeholder:text-ink-subtle transition-colors focus:border-[var(--club-primary)] " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--club-primary)]/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL, "h-10 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

/**
 * A switch with a real checkbox behind it, so it posts with the form, is
 * keyboard operable and announces its state without extra ARIA plumbing.
 */
export function Toggle({
  name,
  defaultChecked = false,
  onChange,
  label,
  disabled,
}: {
  name?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const id = useId();

  return (
    <span className="inline-flex items-center gap-2.5">
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          setChecked(e.target.checked);
          onChange?.(e.target.checked);
        }}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--club-primary)]/40 peer-focus-visible:ring-offset-2",
          checked ? "bg-[var(--club-primary)]" : "bg-grey-200",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-surface-raised shadow-sm transition-[left] duration-150",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </label>
      {/* The state is spelled out, not just coloured. */}
      <span className="text-[13px] font-medium text-ink-muted tabular-nums">
        {checked ? "On" : "Off"}
      </span>
    </span>
  );
}

export function RadioCard({
  name,
  value,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  value: string;
  title: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "block cursor-pointer rounded-xl border border-line-strong/40 bg-surface-raised p-4 transition-colors",
          "hover:border-[var(--club-primary)]/40",
          "peer-checked:border-[var(--club-primary)] peer-checked:bg-[var(--club-primary-soft)]",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--club-primary)]/30",
        )}
      >
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description ? (
          <span className="mt-1 block text-[13px] text-ink-muted leading-relaxed">{description}</span>
        ) : null}
      </label>
    </div>
  );
}
