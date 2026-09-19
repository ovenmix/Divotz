import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "club" | "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  /*
   * The club variant reads its colour from the theme tokens, including the
   * *computed* foreground. Never hardcode text colour here - a club may have a
   * near-white brand colour and a club may have a near-black one.
   */
  club:
    "bg-[var(--club-primary)] text-[var(--club-primary-foreground)] hover:bg-[var(--club-primary-hover)] shadow-card",
  solid: "bg-grey-500 text-cream-100 hover:bg-grey-600 shadow-card",
  outline: "bg-surface-raised text-ink border border-line-strong/60 hover:bg-cream-500",
  ghost: "text-ink-muted hover:text-ink hover:bg-cream-500",
  danger: "bg-danger-500 text-cream-100 hover:bg-danger-700 shadow-card",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center font-medium transition-colors duration-150 " +
  "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function buttonClass(variant: Variant = "club", size: Size = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({ variant = "club", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({ variant = "club", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
