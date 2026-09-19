/**
 * Navigation is generated, never hand-written.
 *
 * Two inputs decide what a person sees: what the club has turned on, and what
 * this person is allowed to do. A club that doesn't run leagues has no Leagues
 * link - not a greyed-out one. A golfer has no Admin link at all.
 */

import type { IconName } from "@/components/nav/icons";
import type { ClubAccess } from "./domain/permissions";
import { can, canAny, canSeeAdmin } from "./domain/permissions";
import type { Club } from "./domain/types";

export type NavItem = {
  label: string;
  href: string;
  /** A key into the client-side icon registry, not a component. */
  icon?: IconName;
  /** Matched as a prefix so child pages keep the parent highlighted. */
  match?: string;
  badge?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

/* ------------------------------------------------------- club public nav */

export function buildClubNav(club: Club, access: ClubAccess): NavItem[] {
  const items: NavItem[] = [];
  const enabled = new Set(club.navigation);

  if (enabled.has("home")) items.push({ label: "Home", href: "/", icon: "home", match: "exact" });

  // A club with tournaments turned off has no Tournaments section - rather
  // than a section that opens onto nothing.
  if (enabled.has("tournaments") && club.features.publicTournaments) {
    items.push({ label: "Tournaments", href: "/tournaments", icon: "trophy" });
  }
  if (enabled.has("leagues") && club.features.leagues) {
    items.push({ label: "Leagues", href: "/leagues", icon: "calendar" });
  }
  if (enabled.has("members")) {
    items.push({ label: "Members", href: "/members", icon: "members" });
  }
  if (enabled.has("about")) items.push({ label: "About", href: "/about", icon: "info" });
  if (enabled.has("rules") && club.rules) {
    items.push({ label: "Rules", href: "/rules", icon: "rules" });
  }

  return items;
}

/** The golfer's own corner of the club. Only meaningful once signed in. */
export function buildMyGolfNav(access: ClubAccess): NavItem[] {
  if (!access.signedIn) return [];
  return [{ label: "My Golf", href: "/my-golf", icon: "flag" }];
}

/* -------------------------------------------------------------- admin nav */

/**
 * The admin sidebar: the club's control room, still inside the club.
 *
 * Sections disappear entirely when the club doesn't use the feature or the
 * person can't touch it. An organizer sees Events and nothing else.
 */
export function buildAdminNav(club: Club, access: ClubAccess): NavSection[] {
  const sections: NavSection[] = [];

  sections.push({
    items: [{ label: "Overview", href: "/admin", icon: "overview", match: "exact" }],
  });

  const events: NavItem[] = [];
  if (can(access, "events.view")) {
    events.push({ label: "Tournaments", href: "/admin/tournaments", icon: "trophy" });
    if (club.features.leagues) {
      events.push({ label: "Leagues", href: "/admin/leagues", icon: "calendar" });
    }
  }
  if (events.length) sections.push({ title: "Events", items: events });

  const people: NavItem[] = [];
  if (can(access, "people.view")) {
    people.push({ label: "Users", href: "/admin/users", icon: "users" });
    people.push({ label: "Members", href: "/admin/members", icon: "memberBadge" });
  }
  if (can(access, "club.manage")) {
    people.push({ label: "Staff", href: "/admin/staff", icon: "user" });
  }
  if (people.length) sections.push({ title: "People", items: people });

  const clubSection: NavItem[] = [];
  if (can(access, "club.manage")) {
    clubSection.push({ label: "Settings", href: "/admin/settings", icon: "settings" });
  }
  if (can(access, "club.branding")) {
    clubSection.push({ label: "Branding", href: "/admin/branding", icon: "palette" });
  }
  if (can(access, "club.manage")) {
    clubSection.push({ label: "Rules", href: "/admin/rules", icon: "rules" });
  }
  if (can(access, "club.manage") && club.features.emailNotifications) {
    clubSection.push({ label: "Communications", href: "/admin/communications", icon: "megaphone" });
  }
  if (clubSection.length) sections.push({ title: "Club", items: clubSection });

  const integrations: NavItem[] = [];
  // Payments only appears when the club actually takes money online, or when
  // someone with the rights could turn it on.
  if (club.features.onlinePayments && canAny(access, ["payments.view", "payments.manage"])) {
    integrations.push({ label: "Payments", href: "/admin/integrations/payments", icon: "payments" });
  }
  if (can(access, "club.integrations")) {
    if (!club.features.onlinePayments) {
      integrations.push({ label: "Payments", href: "/admin/integrations/payments", icon: "payments" });
    }
    if (club.features.teeSheetIntegration) {
      integrations.push({ label: "Tee sheets", href: "/admin/integrations/tee-sheets", icon: "teeSheet" });
    }
    integrations.push({ label: "All integrations", href: "/admin/integrations", icon: "integrations" });
  }
  if (integrations.length) sections.push({ title: "Integrations", items: integrations });

  if (can(access, "club.pro")) {
    sections.push({
      title: "Pro",
      items: [{ label: "Club customization", href: "/admin/pro", icon: "pro" }],
    });
  }

  return sections;
}

/* --------------------------------------------------------- tournament nav */

/** A third layer, scoped to one event. */
export function buildTournamentNav(
  slug: string,
  options: { payments: boolean; leaderboard: boolean; scorecards: boolean; teeSheet: boolean },
): NavSection[] {
  const base = `/admin/tournaments/${slug}`;
  const items: NavItem[] = [
    { label: "Overview", href: base, icon: "overview", match: "exact" },
    { label: "Players", href: `${base}/players`, icon: "users" },
    { label: "Registration", href: `${base}/registration`, icon: "registration" },
    { label: "Groups", href: `${base}/groups`, icon: "members" },
  ];
  if (options.teeSheet) items.push({ label: "Tee sheet", href: `${base}/tee-sheet`, icon: "teeSheet" });
  items.push({ label: "Scoring", href: `${base}/scoring`, icon: "scoring" });
  if (options.leaderboard) {
    items.push({ label: "Leaderboard", href: `${base}/leaderboard`, icon: "trophy" });
  }
  if (options.scorecards) {
    items.push({ label: "Scorecards", href: `${base}/scorecards`, icon: "rules" });
  }
  if (options.payments) items.push({ label: "Payments", href: `${base}/payments`, icon: "payments" });
  items.push({ label: "Settings", href: `${base}/settings`, icon: "settings" });

  return [{ items }];
}

/* ------------------------------------------------------------ platform nav */

/**
 * The platform dashboard stays deliberately small.
 *
 * It answers "what Divotz things do I own or belong to?" and holds the
 * operations that sit *above* a club. Club administration is not here.
 */
export function buildDashboardNav(): NavSection[] {
  return [
    {
      items: [
        { label: "Your Divotz", href: "/dashboard", icon: "home", match: "exact" },
        { label: "Clubs", href: "/dashboard/clubs", icon: "club" },
        { label: "Tournaments", href: "/dashboard/tournaments", icon: "trophy" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Profile", href: "/dashboard/account", icon: "user" },
        { label: "Pro", href: "/dashboard/pro", icon: "pro" },
        { label: "Email", href: "/dashboard/account/email", icon: "mail" },
      ],
    },
  ];
}

export { canSeeAdmin };
