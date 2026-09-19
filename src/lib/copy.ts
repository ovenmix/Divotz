/**
 * The Divotz voice.
 *
 * Golf language is seasoning, not the meal. Every playful line here is paired
 * with a plain one that actually tells the user what happened and what to do -
 * the joke is never the only thing on screen.
 *
 * Picking is seeded rather than random so the server and client agree on the
 * same line and React does not throw a hydration mismatch. Use the error's
 * digest, a slug, an id - anything stable for that render.
 */

export type ErrorCopy = {
  /** Large, human. */
  headline: string;
  /** Plain-language explanation. Never a joke. */
  explanation: string;
};

const GENERAL_ERRORS: ErrorCopy[] = [
  { headline: "Looks like we hit a bunker.", explanation: "Something went wrong on our side while loading this page." },
  { headline: "That shot took an unfortunate bounce.", explanation: "We couldn't finish loading this page." },
  { headline: "We've got a little divot to repair.", explanation: "Part of this page failed to load." },
  { headline: "This one went way left.", explanation: "We ran into an unexpected problem handling your request." },
  { headline: "Looks like this request found the water.", explanation: "The request didn't make it through. It's usually worth another try." },
  { headline: "We're still looking for that ball.", explanation: "We couldn't retrieve what this page needs right now." },
  { headline: "The clubhouse computer is having a moment.", explanation: "Something on our end isn't responding. We've logged it." },
  { headline: "That one missed the green.", explanation: "We couldn't complete this action." },
  { headline: "Something went out of bounds.", explanation: "The request failed before it finished." },
  { headline: "Looks like someone forgot to rake the bunker.", explanation: "We hit an unexpected state loading this page." },
];

const NOT_FOUND: ErrorCopy[] = [
  { headline: "Looks like this ball landed somewhere else.", explanation: "We couldn't find the page you're looking for." },
  { headline: "The tee sheet took a cart path.", explanation: "That page doesn't exist, or it's been moved." },
  { headline: "This one's not on the course.", explanation: "We couldn't find the page you're looking for." },
];

const LOADING: string[] = [
  "Finding the fairway…",
  "Setting the tee sheet…",
  "Checking the clubhouse…",
  "Finding your group…",
  "Walking up to the green…",
];

/** Stable hash so a given seed always yields the same line. */
function seedIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

export function errorCopy(seed = "divotz"): ErrorCopy {
  return GENERAL_ERRORS[seedIndex(seed, GENERAL_ERRORS.length)];
}

export function notFoundCopy(seed = "divotz"): ErrorCopy {
  return NOT_FOUND[seedIndex(seed, NOT_FOUND.length)];
}

export function loadingCopy(seed = "divotz"): string {
  return LOADING[seedIndex(seed, LOADING.length)];
}

/**
 * A support reference like DVT-8F3A2.
 *
 * Shown small, under the friendly copy. It gives support something to search
 * for without putting a stack trace in front of a golfer.
 */
export function errorReference(seed?: string): string {
  const basis = seed ?? String(Date.now());
  let hash = 0x811c9dc5;
  for (let i = 0; i < basis.length; i++) {
    hash ^= basis.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return "DVT-" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 5);
}

/** Time-of-day greeting for the admin overview. */
export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Empty-state copy, keyed by what's empty. */
export const EMPTY_STATES: Record<string, { headline: string; body: string }> = {
  tournaments: {
    headline: "No tournaments yet.",
    body: "The tee sheet is looking suspiciously empty. Create your first tournament to get things moving.",
  },
  leagues: {
    headline: "No leagues yet.",
    body: "Leagues are for the events that run week after week. Set one up and Divotz keeps the standings.",
  },
  members: {
    headline: "No members yet.",
    body: "Import your membership list and Divotz will match members to accounts as they sign up.",
  },
  users: {
    headline: "Nobody here yet.",
    body: "People show up here once they register for an event or join the club.",
  },
  players: {
    headline: "No players registered.",
    body: "Once registration opens, players land here. Staff can also add them directly.",
  },
  groups: {
    headline: "No groups yet.",
    body: "Build groups once you know who's playing, then push them to your tee sheet.",
  },
  results: {
    headline: "No results yet.",
    body: "Scores show up here as they come in from the course.",
  },
  staff: {
    headline: "No staff yet.",
    body: "Add the people who help run your events, and choose what each of them can reach.",
  },
};
