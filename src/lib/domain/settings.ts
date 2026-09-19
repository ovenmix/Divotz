/**
 * Club default -> event inherit -> event override.
 *
 * Resolution happens here and only here. UI never reads `tournament.overrides`
 * directly, because a raw `null` is not an answer to "can people register?".
 * It asks for a ResolvedSetting, which carries both the effective value and
 * where that value came from - which is what lets an event page explain itself
 * to an admin wondering why this one behaves differently.
 */

import type {
  Club,
  ClubFeature,
  LeaderboardVisibility,
  League,
  PaymentMode,
  RegistrationField,
  RegistrationMode,
  Tournament,
} from "./types";

export type SettingSource = "inherited" | "override" | "forcedByClub";

export type ResolvedSetting<T> = {
  value: T;
  source: SettingSource;
  clubDefault: T;
  /** True when the event deliberately differs from the club. */
  overridden: boolean;
};

function resolve<T>(clubDefault: T, override: T | null, forced?: T): ResolvedSetting<T> {
  // A disabled club feature wins over any event-level value. An event cannot
  // opt back into something the club turned off.
  if (forced !== undefined) {
    return { value: forced, source: "forcedByClub", clubDefault, overridden: false };
  }
  if (override === null || override === undefined) {
    return { value: clubDefault, source: "inherited", clubDefault, overridden: false };
  }
  return {
    value: override,
    source: "override",
    clubDefault,
    overridden: override !== clubDefault,
  };
}

export type ResolvedEventSettings = {
  registration: ResolvedSetting<RegistrationMode>;
  payment: ResolvedSetting<PaymentMode>;
  leaderboard: ResolvedSetting<LeaderboardVisibility>;
  partnerRequests: ResolvedSetting<boolean>;
  /** Club defaults plus this event's own fields, in that order. */
  registrationFields: RegistrationField[];
};

export function resolveEventSettings(
  club: Club | null,
  event: Pick<Tournament, "overrides"> & { extraFields?: RegistrationField[] },
): ResolvedEventSettings {
  // A standalone tournament has no club, so it is its own default.
  if (!club) {
    return {
      registration: resolve<RegistrationMode>("public", event.overrides.registration),
      payment: resolve<PaymentMode>("none", event.overrides.payment),
      leaderboard: resolve<LeaderboardVisibility>("public", event.overrides.leaderboard),
      partnerRequests: resolve<boolean>(false, event.overrides.partnerRequests),
      registrationFields: event.extraFields ?? [],
    };
  }

  const { defaults, features } = club;

  return {
    registration: resolve<RegistrationMode>(
      defaults.registration,
      event.overrides.registration,
      features.onlineRegistration ? undefined : "staffManaged",
    ),
    payment: resolve<PaymentMode>(
      defaults.payment,
      event.overrides.payment,
      features.onlinePayments ? undefined : "none",
    ),
    leaderboard: resolve<LeaderboardVisibility>(
      defaults.leaderboard,
      event.overrides.leaderboard,
      features.liveLeaderboards ? undefined : "off",
    ),
    partnerRequests: resolve<boolean>(
      defaults.partnerRequests,
      event.overrides.partnerRequests,
      features.partnerRequests ? undefined : false,
    ),
    registrationFields: [...defaults.registrationFields, ...(event.extraFields ?? [])],
  };
}

export function resolveLeagueSettings(club: Club, league: League): ResolvedEventSettings {
  return resolveEventSettings(club, { overrides: league.overrides, extraFields: [] });
}

/* ------------------------------------------------------------------ labels */

export const REGISTRATION_LABELS: Record<RegistrationMode, string> = {
  off: "Registration closed",
  public: "Public",
  publicWithApproval: "Public, with approval",
  membersOnly: "Members only",
  inviteOnly: "Invite only",
  staffManaged: "Staff managed",
};

export const REGISTRATION_DESCRIPTIONS: Record<RegistrationMode, string> = {
  off: "Nobody can register, including staff.",
  public: "Anyone can register, member or not.",
  publicWithApproval: "Anyone can request a spot. Staff approve each one.",
  membersOnly: "Only people with an active membership can register.",
  inviteOnly: "Only people who receive an invitation can register.",
  staffManaged: "Golfers can't register themselves. Staff add players directly.",
};

export const PAYMENT_LABELS: Record<PaymentMode, string> = {
  none: "No payment",
  clubDirect: "Pay the club directly",
  divotzCheckout: "Pay through Divotz",
};

export const PAYMENT_DESCRIPTIONS: Record<PaymentMode, string> = {
  none: "Registration collects information only. Nothing is charged.",
  clubDirect: "The club collects payment its own way. Divotz records the registration.",
  divotzCheckout: "Divotz processes the payment and passes it on to the club, less the service fee.",
};

export const LEADERBOARD_LABELS: Record<LeaderboardVisibility, string> = {
  off: "No leaderboard",
  private: "Staff only",
  participants: "Players only",
  public: "Public",
};

export const FEATURE_LABELS: Record<ClubFeature, { title: string; description: string; consequence: string }> = {
  onlinePayments: {
    title: "Online payments",
    description: "Let Divotz collect entry fees for your events.",
    consequence: "When off, payment setup disappears from event creation and no event offers online payment.",
  },
  onlineRegistration: {
    title: "Online registration",
    description: "Let golfers register for events themselves.",
    consequence: "When off, every event is staff-managed and no registration forms are shown.",
  },
  publicTournaments: {
    title: "Public tournaments",
    description: "Show tournaments to people who aren't signed in.",
    consequence: "When off, the Tournaments section is hidden from your public club site.",
  },
  memberRegistration: {
    title: "Member registration",
    description: "Check membership when someone registers for a members-only event.",
    consequence: "When off, members-only registration isn't available as an option.",
  },
  leagues: {
    title: "Leagues",
    description: "Run recurring weekly events with standings.",
    consequence: "When off, Leagues disappears from your club navigation and admin.",
  },
  partnerRequests: {
    title: "Partner requests",
    description: "Let golfers ask to be grouped with someone when they register.",
    consequence: "When off, the partner question is removed from registration forms.",
  },
  scorecardScanning: {
    title: "Scorecard scanning",
    description: "Enter scores by photographing a paper scorecard.",
    consequence: "When off, scores are entered by hand only.",
  },
  emailNotifications: {
    title: "Email notifications",
    description: "Send confirmations, reminders and results by email.",
    consequence: "When off, Divotz sends nothing on your club's behalf.",
  },
  liveLeaderboards: {
    title: "Live leaderboards",
    description: "Show scores updating during play.",
    consequence: "When off, leaderboard settings are removed from every event.",
  },
  handicapIntegration: {
    title: "Handicap integration",
    description: "Keep member handicaps in step with your handicap provider.",
    consequence: "When off, handicaps are entered and edited by hand.",
  },
  teeSheetIntegration: {
    title: "Tee sheet integration",
    description: "Push groups and tee times to your tee sheet provider.",
    consequence: "When off, Integrations hides tee sheet setup and events won't offer a push.",
  },
};

/* ------------------------------------------------- registration availability */

export type RegistrationAvailability = {
  /** Which of the spec's registration states this event is in right now. */
  state:
    | "open"
    | "closed"
    | "membersOnly"
    | "inviteOnly"
    | "staffOnly"
    | "approvalRequired"
    | "full"
    | "waitlist";
  /** Specific language, never a generic "Unavailable". */
  label: string;
  /** Whether the visitor in front of us can act on it. */
  canRegister: boolean;
};

export type Viewer = {
  signedIn: boolean;
  isActiveMember: boolean;
  isStaff: boolean;
  invited?: boolean;
};

export function registrationAvailability(
  mode: RegistrationMode,
  viewer: Viewer,
  counts: { registered: number; capacity?: number | null; waitlistEnabled?: boolean },
): RegistrationAvailability {
  const full = counts.capacity != null && counts.registered >= counts.capacity;

  if (mode === "off") {
    return { state: "closed", label: "Registration closed", canRegister: false };
  }
  if (mode === "staffManaged") {
    return {
      state: "staffOnly",
      label: "Staff registration",
      canRegister: viewer.isStaff,
    };
  }
  if (full) {
    return counts.waitlistEnabled
      ? { state: "waitlist", label: "Waitlist open", canRegister: true }
      : { state: "full", label: "Tournament is full", canRegister: false };
  }
  if (mode === "membersOnly") {
    return {
      state: "membersOnly",
      label: "Members only",
      canRegister: viewer.isActiveMember || viewer.isStaff,
    };
  }
  if (mode === "inviteOnly") {
    return {
      state: "inviteOnly",
      label: "Invite only",
      canRegister: Boolean(viewer.invited) || viewer.isStaff,
    };
  }
  if (mode === "publicWithApproval") {
    return { state: "approvalRequired", label: "Open - staff approve entries", canRegister: true };
  }
  return { state: "open", label: "Registration open", canRegister: true };
}
