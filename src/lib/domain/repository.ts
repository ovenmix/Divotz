/**
 * Data access.
 *
 * Every accessor is async and returns plain domain objects, so the store
 * underneath can be swapped for a real database without any page changing.
 * Nothing above this file knows where the data lives - which is the point:
 * a golfer should never find out that Divotz has tenants and a database.
 *
 * Writes mutate the in-memory arrays. That is sufficient for driving the
 * product, and every mutation is the shape a real `update ... where` would be.
 */

import "server-only";

import {
  CLUBS,
  LEAGUES,
  MEMBERS,
  PAYMENTS,
  PRO_SUBSCRIPTIONS,
  REGISTRATIONS,
  STAFF,
  TOURNAMENTS,
  USERS,
} from "./seed";
import { isActiveMember } from "./membership";
import { buildAccess, type ClubAccess, ANONYMOUS_ACCESS } from "./permissions";
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
  UserId,
} from "./types";

const clone = <T,>(value: T): T => structuredClone(value);

/* ------------------------------------------------------------------- clubs */

export async function getClubBySlug(slug: string): Promise<Club | null> {
  return clone(CLUBS.find((club) => club.slug === slug) ?? null);
}

export async function getClubById(id: string): Promise<Club | null> {
  return clone(CLUBS.find((club) => club.id === id) ?? null);
}

/** Clubs the user owns, staffs or belongs to - what the dashboard lists. */
export async function getClubsForUser(userId: UserId): Promise<
  { club: Club; relationship: "owner" | "staff" | "member" }[]
> {
  const result: { club: Club; relationship: "owner" | "staff" | "member" }[] = [];
  for (const club of CLUBS) {
    if (club.ownerId === userId) {
      result.push({ club: clone(club), relationship: "owner" });
      continue;
    }
    if (STAFF.some((s) => s.clubId === club.id && s.userId === userId)) {
      result.push({ club: clone(club), relationship: "staff" });
      continue;
    }
    if (MEMBERS.some((m) => m.clubId === club.id && m.userId === userId)) {
      result.push({ club: clone(club), relationship: "member" });
    }
  }
  return result;
}

export async function updateClub(clubId: string, patch: Partial<Club>): Promise<Club | null> {
  const index = CLUBS.findIndex((club) => club.id === clubId);
  if (index === -1) return null;
  CLUBS[index] = { ...CLUBS[index], ...patch };
  return clone(CLUBS[index]);
}

export async function deleteClub(clubId: string): Promise<boolean> {
  const index = CLUBS.findIndex((club) => club.id === clubId);
  if (index === -1) return false;
  CLUBS.splice(index, 1);
  return true;
}

export async function createClub(input: {
  name: string;
  slug: string;
  ownerId: UserId;
  location?: string;
  description?: string;
}): Promise<Club> {
  const club: Club = {
    id: `c_${input.slug}`,
    slug: input.slug,
    name: input.name,
    description: input.description,
    location: input.location,
    ownerId: input.ownerId,
    plan: "free",
    customDomain: null,
    features: {
      onlinePayments: false,
      onlineRegistration: true,
      publicTournaments: true,
      memberRegistration: true,
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
      // A new club can upload its logo on day one. Logo is never a Pro gate.
      logoUrl: null,
      iconUrl: null,
      heroImageUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      displayFont: null,
    },
    navigation: ["home", "tournaments", "about"],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  CLUBS.push(club);
  return clone(club);
}

/* ------------------------------------------------------------------ people */

export async function getUser(userId: UserId): Promise<User | null> {
  return clone(USERS.find((user) => user.id === userId) ?? null);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  return clone(USERS.find((user) => user.email.toLowerCase() === normalized) ?? null);
}

export async function getMembers(clubId: string): Promise<Member[]> {
  return clone(MEMBERS.filter((member) => member.clubId === clubId));
}

export async function getMemberForUser(clubId: string, userId: UserId): Promise<Member | null> {
  const direct = MEMBERS.find((m) => m.clubId === clubId && m.userId === userId);
  if (direct) return clone(direct);

  // The person may have signed up after their club imported them. Matching on
  // email is what links the membership record to the new account.
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;
  const byEmail = MEMBERS.find(
    (m) => m.clubId === clubId && m.email.toLowerCase() === user.email.toLowerCase(),
  );
  return clone(byEmail ?? null);
}

export async function getStaff(clubId: string): Promise<Staff[]> {
  return clone(STAFF.filter((staff) => staff.clubId === clubId));
}

export async function getStaffForUser(clubId: string, userId: UserId): Promise<Staff | null> {
  return clone(STAFF.find((s) => s.clubId === clubId && s.userId === userId) ?? null);
}

/**
 * Everyone the club has any relationship with.
 *
 * Deliberately a join rather than a table: a person may be a member without an
 * account, an account holder who once registered for one open event, staff, or
 * several of those at once. The Users page has to show all of them.
 */
export type ClubPerson = {
  userId: UserId | null;
  memberId: string | null;
  name: string;
  email: string;
  phone?: string;
  hasAccount: boolean;
  member: Member | null;
  staff: Staff | null;
  lastActiveAt?: string;
};

export async function getClubPeople(clubId: string): Promise<ClubPerson[]> {
  const people = new Map<string, ClubPerson>();
  const key = (email: string) => email.trim().toLowerCase();

  for (const member of MEMBERS.filter((m) => m.clubId === clubId)) {
    const user = member.userId ? USERS.find((u) => u.id === member.userId) : undefined;
    people.set(key(member.email), {
      userId: member.userId,
      memberId: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone ?? user?.phone,
      hasAccount: Boolean(user?.hasAccount),
      member: clone(member),
      staff: null,
      lastActiveAt: user?.lastActiveAt,
    });
  }

  for (const staff of STAFF.filter((s) => s.clubId === clubId)) {
    const user = USERS.find((u) => u.id === staff.userId);
    if (!user) continue;
    const existing = people.get(key(user.email));
    if (existing) existing.staff = clone(staff);
    else
      people.set(key(user.email), {
        userId: user.id,
        memberId: null,
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasAccount: user.hasAccount,
        member: null,
        staff: clone(staff),
        lastActiveAt: user.lastActiveAt,
      });
  }

  // Anyone who registered for one of the club's events belongs here too, even
  // as a guest with no account and no membership.
  const clubTournamentIds = new Set(
    TOURNAMENTS.filter((t) => t.clubId === clubId).map((t) => t.id),
  );
  for (const registration of REGISTRATIONS) {
    if (!clubTournamentIds.has(registration.tournamentId)) continue;
    const existing = people.get(key(registration.email));
    if (existing) continue;
    const user = registration.userId ? USERS.find((u) => u.id === registration.userId) : undefined;
    people.set(key(registration.email), {
      userId: registration.userId,
      memberId: null,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      hasAccount: Boolean(user?.hasAccount),
      member: null,
      staff: null,
      lastActiveAt: user?.lastActiveAt ?? registration.registeredAt,
    });
  }

  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertMembers(clubId: string, rows: Omit<Member, "id" | "clubId">[]): Promise<{
  created: number;
  updated: number;
}> {
  let created = 0;
  let updated = 0;
  for (const row of rows) {
    const index = MEMBERS.findIndex(
      (m) => m.clubId === clubId && m.email.toLowerCase() === row.email.toLowerCase(),
    );
    if (index === -1) {
      MEMBERS.push({ ...row, id: `m_${Math.random().toString(36).slice(2, 9)}`, clubId });
      created++;
    } else {
      MEMBERS[index] = { ...MEMBERS[index], ...row };
      updated++;
    }
  }
  return { created, updated };
}

/* ------------------------------------------------------------------ events */

export async function getTournaments(clubId: string): Promise<Tournament[]> {
  return clone(
    TOURNAMENTS.filter((t) => t.clubId === clubId).sort((a, b) => a.date.localeCompare(b.date)),
  );
}

export async function getTournamentBySlug(
  clubId: string | null,
  slug: string,
): Promise<Tournament | null> {
  return clone(TOURNAMENTS.find((t) => t.clubId === clubId && t.slug === slug) ?? null);
}

export async function getStandaloneTournamentsForUser(_userId: UserId): Promise<Tournament[]> {
  // Standalone tournaments have no club to hang ownership off, so in a real
  // schema this joins an organiser table. The seed has a single owner.
  return clone(TOURNAMENTS.filter((t) => t.clubId === null));
}

export async function createTournament(input: {
  clubId: string | null;
  name: string;
  slug: string;
  date: string;
  format: Tournament["format"];
  entryFeeCents?: number | null;
  capacity?: number | null;
  description?: string;
}): Promise<Tournament> {
  const tournament: Tournament = {
    id: `t_${Math.random().toString(36).slice(2, 9)}`,
    clubId: input.clubId,
    slug: input.slug,
    name: input.name,
    description: input.description,
    heroImageUrl: null,
    accentColor: null,
    date: input.date,
    format: input.format,
    status: "draft",
    capacity: input.capacity ?? null,
    entryFeeCents: input.entryFeeCents ?? null,
    // A brand new event inherits everything. That is the whole point of club
    // defaults: an organiser should not have to answer the same questions again.
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    extraFields: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  TOURNAMENTS.push(tournament);
  return clone(tournament);
}

export async function updateTournament(id: string, patch: Partial<Tournament>): Promise<Tournament | null> {
  const index = TOURNAMENTS.findIndex((t) => t.id === id);
  if (index === -1) return null;
  TOURNAMENTS[index] = { ...TOURNAMENTS[index], ...patch };
  return clone(TOURNAMENTS[index]);
}

export async function getLeagues(clubId: string): Promise<League[]> {
  return clone(LEAGUES.filter((league) => league.clubId === clubId));
}

export async function getLeagueBySlug(clubId: string, slug: string): Promise<League | null> {
  return clone(LEAGUES.find((l) => l.clubId === clubId && l.slug === slug) ?? null);
}

export async function createLeague(input: {
  clubId: string;
  name: string;
  slug: string;
  dayOfWeek: string;
  startsOn: string;
  endsOn: string;
  description?: string;
}): Promise<League> {
  const league: League = {
    id: `l_${Math.random().toString(36).slice(2, 9)}`,
    clubId: input.clubId,
    slug: input.slug,
    name: input.name,
    description: input.description,
    dayOfWeek: input.dayOfWeek,
    startsOn: input.startsOn,
    endsOn: input.endsOn,
    status: "scheduled",
    overrides: { registration: null, payment: null, leaderboard: null, partnerRequests: null },
    createdAt: new Date().toISOString().slice(0, 10),
  };
  LEAGUES.push(league);
  return clone(league);
}

/* ----------------------------------------------------- registrations, money */

export async function getRegistrations(tournamentId: string): Promise<Registration[]> {
  return clone(REGISTRATIONS.filter((r) => r.tournamentId === tournamentId));
}

export async function countRegistrations(tournamentId: string): Promise<number> {
  return REGISTRATIONS.filter(
    (r) => r.tournamentId === tournamentId && r.status !== "cancelled" && r.status !== "waitlisted",
  ).length;
}

export async function createRegistration(
  input: Omit<Registration, "id" | "registeredAt">,
): Promise<Registration> {
  const registration: Registration = {
    ...input,
    id: `r_${Math.random().toString(36).slice(2, 9)}`,
    registeredAt: new Date().toISOString().slice(0, 10),
  };
  REGISTRATIONS.push(registration);
  return clone(registration);
}

export async function getPayments(clubId: string): Promise<Payment[]> {
  return clone(PAYMENTS.filter((p) => p.clubId === clubId));
}

export async function getProSubscription(userId: UserId): Promise<ProSubscription | null> {
  return clone(PRO_SUBSCRIPTIONS.find((s) => s.userId === userId) ?? null);
}

export async function setProClubs(userId: UserId, clubIds: string[]): Promise<ProSubscription | null> {
  const index = PRO_SUBSCRIPTIONS.findIndex((s) => s.userId === userId);
  if (index === -1) return null;
  PRO_SUBSCRIPTIONS[index] = {
    ...PRO_SUBSCRIPTIONS[index],
    proClubIds: clubIds,
    lastTransferAt: new Date().toISOString().slice(0, 10),
  };
  // A club's plan is derived from the subscription, so move both together.
  for (const club of CLUBS) {
    if (club.ownerId !== userId) continue;
    club.plan = clubIds.includes(club.id) ? "pro" : "free";
  }
  return clone(PRO_SUBSCRIPTIONS[index]);
}

/* ------------------------------------------------------------------ access */

/** Resolve what a given viewer may do inside a given club, in one query. */
export async function getClubAccess(club: Club, userId: UserId | null): Promise<ClubAccess> {
  if (!userId) return ANONYMOUS_ACCESS;
  const [staff, member] = await Promise.all([
    getStaffForUser(club.id, userId),
    getMemberForUser(club.id, userId),
  ]);
  return buildAccess({
    signedIn: true,
    isOwner: club.ownerId === userId,
    isMember: isActiveMember(member),
    staff,
  });
}
