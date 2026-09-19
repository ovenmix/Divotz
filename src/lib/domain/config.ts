/**
 * Platform configuration.
 *
 * Everything here is a knob, not a constant scattered through components. The
 * service fee in particular must never be written into a UI component: the
 * percentage is not final, and when it changes it should change in one place
 * and be reflected everywhere a total is shown.
 */

const num = (value: string | undefined, fallback: number) => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const PLATFORM = {
  /** Divotz service fee on checkout, as a rate. Not assumed to stay at 3%. */
  serviceFeeRate: num(process.env.DIVOTZ_SERVICE_FEE_RATE, 0.03),
  /** Floor so tiny entry fees still cover processing. */
  serviceFeeMinimumCents: num(process.env.DIVOTZ_SERVICE_FEE_MIN_CENTS, 50),
  /** Cap so a big charity entry fee doesn't carry an absurd fee. */
  serviceFeeMaximumCents: num(process.env.DIVOTZ_SERVICE_FEE_MAX_CENTS, 1500),

  pro: {
    monthlyCents: num(process.env.DIVOTZ_PRO_MONTHLY_CENTS, 1500),
    seasonalCents: num(process.env.DIVOTZ_PRO_SEASONAL_CENTS, 7000),
    /** A Pro subscription covers at most this many clubs at once. */
    maxProClubs: num(process.env.DIVOTZ_PRO_MAX_CLUBS, 2),
    /** How long before Pro can be moved between clubs again, in days. */
    transferCooldownDays: num(process.env.DIVOTZ_PRO_TRANSFER_COOLDOWN_DAYS, 30),
  },

  /** The base domain clubs live on: <slug>.divotz.ca */
  rootDomain: process.env.NEXT_PUBLIC_DIVOTZ_ROOT_DOMAIN ?? "divotz.ca",
} as const;

export type FeeBreakdown = {
  entryFeeCents: number;
  feeCents: number;
  totalCents: number;
  feeRate: number;
};

/**
 * Work out what a golfer actually pays.
 *
 * Called from one place so the registration summary, the receipt and the club's
 * payment report can never disagree about the total.
 */
export function computeFees(entryFeeCents: number, mode: "divotzCheckout" | "clubDirect" | "none"): FeeBreakdown {
  if (mode !== "divotzCheckout" || entryFeeCents <= 0) {
    return { entryFeeCents, feeCents: 0, totalCents: entryFeeCents, feeRate: 0 };
  }
  const raw = Math.round(entryFeeCents * PLATFORM.serviceFeeRate);
  const feeCents = Math.min(
    PLATFORM.serviceFeeMaximumCents,
    Math.max(PLATFORM.serviceFeeMinimumCents, raw),
  );
  return {
    entryFeeCents,
    feeCents,
    totalCents: entryFeeCents + feeCents,
    feeRate: PLATFORM.serviceFeeRate,
  };
}

export function formatMoney(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(cents / 100);
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 1)}%`;
}

/** Pro is customization and polish. Core tournament running is never in here. */
export const PRO_FEATURES = [
  "colors",
  "typography",
  "photography",
  "emailTemplates",
  "customDomain",
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];

export const PRO_FEATURE_LABELS: Record<ProFeature, { title: string; description: string }> = {
  colors: {
    title: "Club colours",
    description: "Use your club's own colours across its public pages, navigation and event pages.",
  },
  typography: {
    title: "Club typography",
    description: "Set the typeface your club's pages and scorecards are set in.",
  },
  photography: {
    title: "Club photography",
    description: "Put your own course photography behind your club home page and event pages.",
  },
  emailTemplates: {
    title: "Custom email templates",
    description: "Send confirmations and announcements in your club's own layout and wording.",
  },
  customDomain: {
    title: "Custom domain",
    description: "Run your club on your own domain instead of a divotz.ca address.",
  },
};
