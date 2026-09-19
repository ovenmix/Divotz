/**
 * Colour awareness for club branding.
 *
 * A club picks a brand colour. We do not get to assume anything about it - it
 * may be near-black, it may be highlighter yellow. Every branded surface
 * therefore ships with a foreground colour we *computed*, never one we
 * hardcoded. `text-black` on a club-coloured button is a bug.
 */

export type Rgb = { r: number; g: number; b: number };

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(hex: string): Rgb | null {
  const match = HEX.exec(hex.trim());
  if (!match) return null;
  let body = match[1];
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
}

export function toHex({ r, g, b }: Rgb): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return (
    "#" +
    [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

const channelLuminance = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

/** WCAG contrast ratio between two colours, 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Divotz ink and paper. We contrast against these rather than pure black and
 * pure white, because the product never uses pure black or pure white.
 */
const INK: Rgb = { r: 0x1e, g: 0x21, b: 0x1e }; // grey-800
const PAPER: Rgb = { r: 0xfc, g: 0xfb, b: 0xf7 }; // cream-100

/**
 * Pick the foreground that reads best on `background`.
 *
 * Whichever of ink/paper wins on contrast is the answer - so a dark club colour
 * gets light text and a light club colour gets dark text, with no assumption
 * about which case we are in.
 */
export function foregroundFor(background: Rgb | string): string {
  const bg = typeof background === "string" ? parseHex(background) : background;
  if (!bg) return toHex(INK);
  return contrastRatio(bg, PAPER) >= contrastRatio(bg, INK) ? toHex(PAPER) : toHex(INK);
}

/** True when a club colour is dark enough to need light text on top of it. */
export function isDark(color: Rgb | string): boolean {
  const rgb = typeof color === "string" ? parseHex(color) : color;
  if (!rgb) return false;
  return relativeLuminance(rgb) < 0.4;
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: a.r + (b.r - a.r) * t,
  g: a.g + (b.g - a.g) * t,
  b: a.b + (b.b - a.b) * t,
});

/**
 * A soft wash of the club colour, for tinted panels and badges.
 *
 * Mixing toward paper rather than white keeps the result inside the warm
 * Divotz palette instead of turning pastel-blue.
 */
export function softTint(color: Rgb | string, amount = 0.88): string {
  const rgb = typeof color === "string" ? parseHex(color) : color;
  if (!rgb) return toHex(PAPER);
  return toHex(mix(rgb, PAPER, amount));
}

/** A deepened club colour for hover/pressed states on branded surfaces. */
export function shade(color: Rgb | string, amount = 0.15): string {
  const rgb = typeof color === "string" ? parseHex(color) : color;
  if (!rgb) return toHex(INK);
  // Deepen a light colour, lift a very dark one, so hover is always visible.
  return isDark(rgb) ? toHex(mix(rgb, PAPER, amount * 0.8)) : toHex(mix(rgb, INK, amount));
}

/**
 * Readability guard for club colours used as *text* on a pale surface.
 *
 * A club may legitimately choose a pale yellow for buttons, where we simply
 * put dark text on it. The same yellow as link text on cream would be
 * unreadable, so we darken it until it clears the WCAG AA threshold.
 */
export function readableOnSurface(color: Rgb | string, surface: Rgb = PAPER, target = 4.5): string {
  const rgb = typeof color === "string" ? parseHex(color) : color;
  if (!rgb) return toHex(INK);
  let current = rgb;
  for (let i = 0; i < 24 && contrastRatio(current, surface) < target; i++) {
    current = mix(current, INK, 0.08);
  }
  return toHex(current);
}

export type ClubThemeTokens = {
  "--club-primary": string;
  "--club-primary-foreground": string;
  "--club-primary-soft": string;
  "--club-primary-hover": string;
  "--club-primary-readable": string;
  "--club-secondary": string;
  "--club-secondary-foreground": string;
  "--club-accent": string;
  "--club-accent-foreground": string;
};

export type ClubPalette = {
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
};

const DEFAULTS = {
  primary: "#5E765A", // green-500
  secondary: "#6F8E9E", // blue-500
  accent: "#D6C19B", // sand-500
};

/**
 * Build the full token set for a club.
 *
 * Every token that lands on a coloured surface has a computed partner, so
 * components can use `var(--club-primary-foreground)` and be correct for any
 * colour a club ever picks.
 */
export function clubThemeTokens(palette: ClubPalette | null | undefined): ClubThemeTokens {
  const primary = normalize(palette?.primary, DEFAULTS.primary);
  const secondary = normalize(palette?.secondary, DEFAULTS.secondary);
  const accent = normalize(palette?.accent, DEFAULTS.accent);

  return {
    "--club-primary": primary,
    "--club-primary-foreground": foregroundFor(primary),
    "--club-primary-soft": softTint(primary),
    "--club-primary-hover": shade(primary),
    "--club-primary-readable": readableOnSurface(primary),
    "--club-secondary": secondary,
    "--club-secondary-foreground": foregroundFor(secondary),
    "--club-accent": accent,
    "--club-accent-foreground": foregroundFor(accent),
  };
}

function normalize(value: string | null | undefined, fallback: string): string {
  const parsed = value ? parseHex(value) : null;
  return parsed ? toHex(parsed) : fallback;
}

/** Serialise tokens into an inline `style` object for a React element. */
export function themeStyle(palette: ClubPalette | null | undefined): React.CSSProperties {
  return clubThemeTokens(palette) as unknown as React.CSSProperties;
}
