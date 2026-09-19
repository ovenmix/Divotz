/**
 * Seed data.
 *
 * Two clubs that operate quite differently on purpose, because the product's
 * whole claim is that a club sets its normal operating model once:
 *
 *   Gleniffer Golf  - Pro, members-first, takes payment through Divotz, runs
 *                     a league. The "full" club.
 *   Mountain View   - Free, public events, no online payment, no leagues. Its
 *                     UI should be visibly *smaller*, not full of disabled
 *                     buttons for things it doesn't do.
 *
 * Plus one standalone tournament with no club at all, which is the reason the
 * platform dashboard exists.
 */

import type {
  Club,
  League,
  Member,
  Payment,
  ProSubscription,
  Registration,
  Staff,
  Tournament,
  User,
} from "./types";

export const USERS: User[] = [
  {
    id: "u_cj",
    name: "CJ Mercer",
    email: "cj@example.com",
    phone: "403-555-0142",
    hasAccount: true,
    createdAt: "2024-03-02",
    lastActiveAt: "2026-09-18",
    savedPaymentMethod: { brand: "Visa", last4: "4242" },
  },
  {
    id: "u_dave",
    name: "Dave Wilson",
    email: "dave@example.com",
    phone: "403-555-0188",
    hasAccount: true,
    createdAt: "2024-04-11",
    lastActiveAt: "2026-09-17",
  },
  {
    id: "u_mia",
    name: "Mia Chen",
    email: "mia@example.com",
    hasAccount: true,
    createdAt: "2025-01-20",
    lastActiveAt: "2026-09-15",
  },
  {
    id: "u_rob",
    name: "Rob Fontaine",
    email: "rob@example.com",
    hasAccount: true,
    createdAt: "2025-05-06",
    lastActiveAt: "2026-08-30",
  },
  {
    id: "u_sarah",
    name: "Sarah Brown",
    email: "sarah@example.com",
    phone: "403-555-0110",
    hasAccount: true,
    createdAt: "2025-06-14",
    lastActiveAt: "2026-09-16",
    savedPaymentMethod: { brand: "Mastercard", last4: "8891" },
  },
  {
    id: "u_ken",
    name: "Ken Alvarez",
    email: "ken@example.com",
    hasAccount: true,
    createdAt: "2026-02-02",
    lastActiveAt: "2026-09-10",
  },
];

const GLENIFFER_FIELDS = [
  {
    id: "f_phone",
    label: "Phone number",
    type: "phone" as const,
    required: true,
    visibility: "private" as const,
  },
];

export const CLUBS: Club[] = [
  {
    id: "c_gleniffer",
    slug: "gleniffer-golf",
    name: "Gleniffer Golf",
    shortName: "Gleniffer",
    description:
      "Eighteen holes along the reservoir, a patio that catches the evening sun, and a Thursday night that's been running since 1987.",
    welcomeMessage:
      "Welcome to Gleniffer. Check the tee sheet, sign up for Thursday, and we'll see you on the first tee.",
    rules:
      "Play ready golf. Repair your divots and pitch marks. Carts stay on the path on 4 and 12. Pace of play is 4 hours 15 minutes - the group ahead sets your pace, not the group behind.",
    contactEmail: "proshop@example.com",
    contactPhone: "403-555-0100",
    location: "Spruce View, Alberta",
    ownerId: "u_cj",
    plan: "pro",
    customDomain: null,
    features: {
      onlinePayments: true,
      onlineRegistration: true,
      publicTournaments: true,
      memberRegistration: true,
      leagues: true,
      partnerRequests: true,
      scorecardScanning: true,
      emailNotifications: true,
      liveLeaderboards: true,
      handicapIntegration: false,
      teeSheetIntegration: true,
    },
    defaults: {
      registration: "membersOnly",
      payment: "divotzCheckout",
      leaderboard: "public",
      partnerRequests: true,
      registrationFields: GLENIFFER_FIELDS,
    },
    branding: {
      logoUrl: "/images/clubs/gleniffer-logo.svg",
      iconUrl: "/images/clubs/gleniffer-icon.svg",
      heroImageUrl: "/images/club-hero-placeholder.jpg",
      primaryColor: "#304832",
      secondaryColor: "#6F8E9E",
      accentColor: "#D6C19B",
      displayFont: null,
    },
    navigation: ["home", "tournaments", "leagues", "members", "about", "rules"],
    createdAt: "2024-03-02",
  },
  {
    id: "c_mountain",
    slug: "mountain-view-golf",
    name: "Mountain View Golf",
    description: "A friendly nine with a view worth the drive.",
    welcomeMessage: "Everyone's welcome here. Bring a friend.",
    contactEmail: "hello@example.com",
    location: "Cochrane, Alberta",
    ownerId: "u_cj",
    plan: "free",
    customDomain: null,
    features: {
      // Deliberately a smaller club: no payments, no leagues. The interface
      // should simply not mention either of them anywhere.
      onlinePayments: false,
      onlineRegistration: true,
      publicTournaments: true,
      memberRegistration: false,
      leagues: false,
      partnerRequests: false,
      scorecardScanning: false,
      emailNotifications: true,
      liveLeaderboards: true,
      handicapIntegration: false,
      teeSheetIntegration: false,
    },
    defaults: {
      registration: "public",
      payment: "none",
      leaderboard: "public",
      partnerRequests: false,
      registrationFields: [],
    },
    branding: {
      logoUrl: null,
      iconUrl: null,
      heroImageUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      displayFont: null,
    },
    navigation: ["home", "tournaments", "about"],
    createdAt: "2025-07-19",
  },
];

export const STAFF: Staff[] = [
  {
    id: "s_dave",
    clubId: "c_gleniffer",
    userId: "u_dave",
    role: "manager",
    permissions: [
      "club.manage",
      "club.branding",
      "club.integrations",
      "events.view",
      "events.create",
      "events.manage",
      "people.view",
      "people.manage",
      "payments.view",
      "payments.manage",
    ],
    addedAt: "2024-04-11",
  },
  {
    id: "s_mia",
    clubId: "c_gleniffer",
    userId: "u_mia",
    role: "organizer",
    permissions: ["events.view", "events.create", "events.manage", "people.view"],
    addedAt: "2025-01-20",
  },
  {
    id: "s_rob",
    clubId: "c_gleniffer",
    userId: "u_rob",
    role: "helper",
    permissions: ["events.view", "people.view"],
    addedAt: "2025-05-06",
  },
];

/** A roster that looks like a real one: mostly fine, a few things to chase. */
export const MEMBERS: Member[] = [
  {
    id: "m_sarah",
    clubId: "c_gleniffer",
    userId: "u_sarah",
    name: "Sarah Brown",
    email: "sarah@example.com",
    phone: "403-555-0110",
    handicap: 14.2,
    status: "active",
    expiresAt: "2027-05-31",
    joinedAt: "2025-06-14",
    source: "import",
  },
  {
    id: "m_cj",
    clubId: "c_gleniffer",
    userId: "u_cj",
    name: "CJ Mercer",
    email: "cj@example.com",
    phone: "403-555-0142",
    handicap: 8.4,
    status: "active",
    expiresAt: "2027-05-31",
    joinedAt: "2024-03-02",
    source: "manual",
  },
  {
    id: "m_dave",
    clubId: "c_gleniffer",
    userId: "u_dave",
    name: "Dave Wilson",
    email: "dave@example.com",
    handicap: 11.0,
    status: "active",
    expiresAt: "2026-10-15",
    joinedAt: "2024-04-11",
    source: "manual",
  },
  {
    id: "m_ken",
    clubId: "c_gleniffer",
    userId: "u_ken",
    name: "Ken Alvarez",
    email: "ken@example.com",
    handicap: 21.7,
    status: "expired",
    expiresAt: "2026-05-31",
    joinedAt: "2026-02-02",
    source: "import",
  },
  // Imported from the club's spreadsheet, no Divotz account yet. This person
  // is a full member regardless - membership does not wait on a signup.
  {
    id: "m_priya",
    clubId: "c_gleniffer",
    userId: null,
    name: "Priya Raman",
    email: "priya@example.com",
    phone: "403-555-0167",
    handicap: 17.5,
    status: "active",
    expiresAt: "2027-05-31",
    joinedAt: "2026-04-02",
    source: "import",
  },
  {
    id: "m_george",
    clubId: "c_gleniffer",
    userId: null,
    name: "George Hollis",
    email: "george@example.com",
    handicap: 26.0,
    status: "active",
    expiresAt: "2026-10-31",
    joinedAt: "2025-04-18",
    source: "import",
  },
  {
    id: "m_lin",
    clubId: "c_gleniffer",
    userId: null,
    name: "Lin Whitaker",
    email: "lin@example.com",
    handicap: 9.8,
    status: "pending",
    expiresAt: null,
    joinedAt: "2026-09-12",
    source: "self-serve",
  },
];

export const TOURNAMENTS: Tournament[] = [
  {
    id: "t_mens_night",
    clubId: "c_gleniffer",
    slug: "mens-night",
    name: "Men's Night",
    description:
      "Thursday evenings, nine holes, shotgun start. Skins, closest to the pin, and the patio afterwards.",
    heroImageUrl: null,
    accentColor: null,
    date: "2026-09-24",
    teeTime: "17:30",
    format: "stableford",
    status: "open",
    capacity: 48,
    entryFeeCents: 2500,
    // Inherits everything from Gleniffer: members only, Divotz checkout.
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    extraFields: [],
    createdAt: "2026-03-01",
  },
  {
    id: "t_club_champ",
    clubId: "c_gleniffer",
    slug: "club-championship",
    name: "Club Championship",
    description: "Thirty-six holes over two days. Gross and net flights. The one that goes on the board.",
    heroImageUrl: "/images/tournament-placeholder.jpg",
    accentColor: null,
    date: "2026-10-03",
    teeTime: "08:00",
    format: "strokePlay",
    status: "open",
    capacity: 72,
    entryFeeCents: 9000,
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: false },
    extraFields: [
      {
        id: "f_flight",
        label: "Preferred flight",
        type: "select",
        options: ["Championship", "First", "Second", "Senior"],
        required: true,
        visibility: "public",
      },
    ],
    createdAt: "2026-05-20",
  },
  {
    id: "t_fall_scramble",
    clubId: "c_gleniffer",
    slug: "fall-scramble",
    name: "Fall Scramble",
    description:
      "Four-person scramble, open to everyone. Bring a team or we'll find you one. Proceeds to the junior program.",
    heroImageUrl: null,
    accentColor: "#A88E63",
    date: "2026-10-11",
    teeTime: "10:00",
    format: "scramble",
    status: "open",
    capacity: 36,
    entryFeeCents: 6000,
    // The exception that proves the rule: Gleniffer is normally members-only,
    // but this one is deliberately public, and the admin UI says so.
    overrides: { registration: "public", payment: null, leaderboard: null, partnerRequests: null },
    extraFields: [
      {
        id: "f_team",
        label: "Team name",
        type: "text",
        required: false,
        visibility: "public",
      },
      {
        id: "f_dietary",
        label: "Dietary requirements",
        type: "text",
        required: false,
        visibility: "private",
      },
    ],
    createdAt: "2026-07-08",
  },
  {
    id: "t_ladies_night",
    clubId: "c_gleniffer",
    slug: "ladies-night",
    name: "Ladies' Night",
    description: "Tuesday evenings, nine holes, all abilities.",
    heroImageUrl: null,
    accentColor: null,
    date: "2026-09-22",
    teeTime: "17:00",
    format: "stableford",
    status: "open",
    capacity: 32,
    entryFeeCents: 2500,
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    extraFields: [],
    createdAt: "2026-03-01",
  },
  {
    id: "t_mountain_open",
    clubId: "c_mountain",
    slug: "mountain-open",
    name: "The Mountain Open",
    description: "Our one big day. Nine holes, two divisions, prizes for everyone who shows up.",
    heroImageUrl: null,
    accentColor: null,
    date: "2026-09-27",
    teeTime: "09:00",
    format: "strokePlay",
    status: "open",
    capacity: null,
    // Mountain View takes no money online, so there is no fee to configure.
    entryFeeCents: null,
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    extraFields: [],
    createdAt: "2026-06-01",
  },
  {
    id: "t_charity",
    // No club. This is what the platform dashboard is for.
    clubId: null,
    slug: "birdies-for-the-hospital",
    name: "Birdies for the Hospital",
    description: "A one-off charity scramble. Everyone welcome, every dollar goes to the children's ward.",
    heroImageUrl: null,
    accentColor: null,
    date: "2026-10-18",
    teeTime: "11:00",
    format: "scramble",
    status: "open",
    capacity: 40,
    entryFeeCents: 12500,
    overrides: { registration: "public", payment: "divotzCheckout", leaderboard: "public", partnerRequests: null },
    extraFields: [],
    createdAt: "2026-08-14",
  },
];

export const LEAGUES: League[] = [
  {
    id: "l_mens",
    clubId: "c_gleniffer",
    slug: "mens-league",
    name: "Men's League",
    description: "Eighteen weeks, Thursday nights, running points. Best twelve weeks count.",
    dayOfWeek: "Thursday",
    startsOn: "2026-05-07",
    endsOn: "2026-09-24",
    status: "inProgress",
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    createdAt: "2026-02-10",
  },
];

/* Registrations are generated so the seed file stays readable. */

const FIRST = ["Alex", "Jordan", "Sam", "Casey", "Morgan", "Riley", "Quinn", "Avery", "Drew", "Reese", "Noel", "Hayden"];
const LAST = ["Brennan", "Okafor", "Nakamura", "Doyle", "Marchetti", "Ferreira", "Kowalski", "Bright", "Halvorsen", "Dube"];

function generated(tournamentId: string, count: number, offset: number): Registration[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[(i + offset) % FIRST.length];
    const last = LAST[(i * 3 + offset) % LAST.length];
    const name = `${first} ${last}`;
    return {
      id: `r_${tournamentId}_${i}`,
      tournamentId,
      userId: null,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      status: "confirmed" as const,
      answers: {},
      registeredAt: "2026-09-08",
      isGuest: false,
    };
  });
}

export const REGISTRATIONS: Registration[] = [
  {
    id: "r_mens_sarah",
    tournamentId: "t_mens_night",
    userId: "u_sarah",
    name: "Sarah Brown",
    email: "sarah@example.com",
    phone: "403-555-0110",
    status: "confirmed",
    answers: { f_phone: "403-555-0110" },
    paymentId: "p_1",
    registeredAt: "2026-09-14",
    isGuest: false,
  },
  {
    id: "r_mens_ken",
    tournamentId: "t_mens_night",
    userId: "u_ken",
    name: "Ken Alvarez",
    email: "ken@example.com",
    // Ken's membership lapsed in May. Staff need to look at this one.
    status: "pendingApproval",
    answers: { f_phone: "403-555-0199" },
    registeredAt: "2026-09-16",
    isGuest: false,
  },
  ...generated("t_mens_night", 34, 0),
  {
    id: "r_scramble_guest",
    tournamentId: "t_fall_scramble",
    userId: null,
    name: "Tom Ridley",
    email: "tom@example.com",
    phone: "403-555-0175",
    status: "confirmed",
    answers: { f_phone: "403-555-0175", f_team: "The Sandbaggers", f_dietary: "Gluten free" },
    paymentId: "p_2",
    registeredAt: "2026-09-11",
    // Registered without an account, which a public event must always allow.
    isGuest: true,
  },
  ...generated("t_fall_scramble", 19, 4),
  ...generated("t_club_champ", 41, 7),
  ...generated("t_ladies_night", 22, 2),
  ...generated("t_mountain_open", 14, 5),
  ...generated("t_charity", 12, 9),
];

export const PAYMENTS: Payment[] = [
  {
    id: "p_1",
    clubId: "c_gleniffer",
    tournamentId: "t_mens_night",
    registrationId: "r_mens_sarah",
    mode: "divotzCheckout",
    amountCents: 2500,
    feeCents: 75,
    totalCents: 2575,
    status: "paid",
    refundedCents: 0,
    method: "Mastercard ••8891",
    paidAt: "2026-09-14",
  },
  {
    id: "p_2",
    clubId: "c_gleniffer",
    tournamentId: "t_fall_scramble",
    registrationId: "r_scramble_guest",
    mode: "divotzCheckout",
    amountCents: 6000,
    feeCents: 180,
    totalCents: 6180,
    status: "paid",
    refundedCents: 0,
    method: "Visa ••1881",
    paidAt: "2026-09-11",
  },
];

export const PRO_SUBSCRIPTIONS: ProSubscription[] = [
  {
    userId: "u_cj",
    plan: "seasonal",
    renewsAt: "2027-04-01",
    proClubIds: ["c_gleniffer"],
    lastTransferAt: "2026-08-24",
  },
];
