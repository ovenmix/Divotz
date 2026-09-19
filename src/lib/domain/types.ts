/**
 * The Divotz domain.
 *
 * Two distinctions matter more than anything else in here:
 *
 *   User != Member. A user is an account. A member is a club's record of
 *   somebody's membership, which can exist before that person ever signs up
 *   and keeps existing after their account goes quiet. They are linked when
 *   the emails match, not merged.
 *
 *   Club default -> event value. Almost every event setting is a resolved
 *   value, not a stored one: the club sets how it normally operates, events
 *   inherit that, and an event may deliberately override. Storing `null` on
 *   the event means "inherit" and is different from storing the same value the
 *   club happens to have today.
 */

/* ------------------------------------------------------------------ people */

export type UserId = string;

export type User = {
  id: UserId;
  name: string;
  email: string;
  phone?: string;
  /** Set once the person has actually created a Divotz account. */
  hasAccount: boolean;
  createdAt: string;
  lastActiveAt?: string;
  savedPaymentMethod?: { brand: string; last4: string } | null;
};

export type MembershipStatus = "active" | "expired" | "pending" | "suspended";

/**
 * A club's record of a member.
 *
 * `userId` is null until a Divotz account with a matching email shows up, so
 * an imported roster is fully usable on day one.
 */
export type Member = {
  id: string;
  clubId: string;
  userId: UserId | null;
  name: string;
  email: string;
  phone?: string;
  handicap?: number | null;
  status: MembershipStatus;
  /** ISO date. First-class: the Users and Members tables both surface it. */
  expiresAt?: string | null;
  joinedAt: string;
  source: "import" | "manual" | "self-serve";
};

export type StaffRole = "owner" | "manager" | "organizer" | "helper";

/**
 * Granular permissions, because "staff" is not one job.
 *
 * Financial permissions are deliberately separate: the volunteer who helps
 * sort groups on a Thursday night has no reason to see what anyone paid.
 */
export type Permission =
  | "club.manage"
  | "club.branding"
  | "club.integrations"
  | "club.pro"
  | "events.view"
  | "events.create"
  | "events.manage"
  | "people.view"
  | "people.manage"
  | "payments.view"
  | "payments.manage"
  | "payments.refund";

export type Staff = {
  id: string;
  clubId: string;
  userId: UserId;
  role: StaffRole;
  permissions: Permission[];
  addedAt: string;
};

/* ------------------------------------------------------------------- clubs */

export type ClubFeature =
  | "onlinePayments"
  | "onlineRegistration"
  | "publicTournaments"
  | "memberRegistration"
  | "leagues"
  | "partnerRequests"
  | "scorecardScanning"
  | "emailNotifications"
  | "liveLeaderboards"
  | "handicapIntegration"
  | "teeSheetIntegration";

export type RegistrationMode =
  | "off"
  | "public"
  | "publicWithApproval"
  | "membersOnly"
  | "inviteOnly"
  | "staffManaged";

export type PaymentMode = "none" | "clubDirect" | "divotzCheckout";

export type LeaderboardVisibility = "off" | "private" | "participants" | "public";

export type RegistrationFieldType = "text" | "select" | "checkbox" | "phone" | "email";

export type RegistrationField = {
  id: string;
  label: string;
  type: RegistrationFieldType;
  options?: string[];
  required: boolean;
  /** Whether other registrants can see the answer (e.g. shirt size: no). */
  visibility: "public" | "private";
};

/** What the club normally does. New events start from here. */
export type ClubDefaults = {
  registration: RegistrationMode;
  payment: PaymentMode;
  leaderboard: LeaderboardVisibility;
  partnerRequests: boolean;
  registrationFields: RegistrationField[];
};

export type ClubBranding = {
  /** Free for every club. Never behind Pro. */
  logoUrl: string | null;
  iconUrl: string | null;
  heroImageUrl: string | null;
  /** Pro only - the club may still read these defaults while on Free. */
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  displayFont: string | null;
};

export type ClubNavItem = "home" | "tournaments" | "leagues" | "members" | "about" | "rules" | "contact";

export type ClubPlan = "free" | "pro";

export type Club = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description?: string;
  welcomeMessage?: string;
  rules?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  ownerId: UserId;
  plan: ClubPlan;
  /** Pro only. Null means the club lives on <slug>.divotz.ca. */
  customDomain?: string | null;
  features: Record<ClubFeature, boolean>;
  defaults: ClubDefaults;
  branding: ClubBranding;
  /** Which sections appear in the club's public navigation. */
  navigation: ClubNavItem[];
  createdAt: string;
};

/* ------------------------------------------------------------------ events */

export type EventStatus = "draft" | "scheduled" | "open" | "closed" | "inProgress" | "complete" | "cancelled";

export type EventFormat = "strokePlay" | "scramble" | "bestBall" | "stableford" | "matchPlay";

/**
 * Event-level settings.
 *
 * `null` means "inherit from the club" and is meaningfully different from a
 * value that matches the club's. If the club later changes its default, an
 * inheriting event follows; an overriding event does not.
 */
export type EventOverrides = {
  registration: RegistrationMode | null;
  payment: PaymentMode | null;
  leaderboard: LeaderboardVisibility | null;
  partnerRequests: boolean | null;
};

export type Tournament = {
  id: string;
  clubId: string | null; // null = standalone, created from the Divotz dashboard
  slug: string;
  name: string;
  description?: string;
  heroImageUrl?: string | null;
  /** An event may have its own accent, but it never replaces club identity. */
  accentColor?: string | null;
  date: string;
  teeTime?: string;
  format: EventFormat;
  status: EventStatus;
  capacity?: number | null;
  entryFeeCents?: number | null;
  overrides: EventOverrides;
  /** Extra fields on top of whatever the club collects by default. */
  extraFields: RegistrationField[];
  createdAt: string;
};

export type League = {
  id: string;
  clubId: string;
  slug: string;
  name: string;
  description?: string;
  dayOfWeek: string;
  startsOn: string;
  endsOn: string;
  status: EventStatus;
  overrides: EventOverrides;
  createdAt: string;
};

export type RegistrationStatus =
  | "confirmed"
  | "pendingApproval"
  | "pendingPayment"
  | "waitlisted"
  | "cancelled";

export type Registration = {
  id: string;
  tournamentId: string;
  /** Null for a guest who registered without an account. */
  userId: UserId | null;
  name: string;
  email: string;
  phone?: string;
  status: RegistrationStatus;
  /** Answers to club-default + event-specific fields, keyed by field id. */
  answers: Record<string, string>;
  paymentId?: string | null;
  registeredAt: string;
  isGuest: boolean;
};

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partiallyRefunded" | "failed";

/**
 * A payment record.
 *
 * Modelled with refunds from the start: a registration can be cancelled, an
 * event can be called off for weather, and a fee can be partially returned.
 * Nothing here assumes a transaction is final.
 */
export type Payment = {
  id: string;
  clubId: string;
  tournamentId: string;
  registrationId: string;
  mode: PaymentMode;
  /** What the club charges. */
  amountCents: number;
  /** The Divotz service fee, computed at charge time from the rate then. */
  feeCents: number;
  totalCents: number;
  status: PaymentStatus;
  refundedCents: number;
  method?: string;
  paidAt?: string | null;
  refundedAt?: string | null;
};

export type ProSubscription = {
  userId: UserId;
  plan: "monthly" | "seasonal";
  renewsAt: string;
  /** Which of this owner's clubs currently hold Pro. */
  proClubIds: string[];
  lastTransferAt?: string | null;
};
