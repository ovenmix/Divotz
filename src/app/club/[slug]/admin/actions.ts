"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClubBySlug, createLeague, createTournament, updateClub } from "@/lib/domain/repository";
import { getSessionUserId } from "@/lib/auth";
import { getClubAccess } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import type { ClubFeature, EventFormat, PaymentMode, RegistrationMode } from "@/lib/domain/types";

/** Slugify a name into something that reads well in a URL. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Every write re-checks permission server-side. Hidden UI is not a guard. */
async function authorize(clubSlug: string, permission: Parameters<typeof can>[1]) {
  const club = await getClubBySlug(clubSlug);
  if (!club) throw new Error("Club not found");
  const userId = await getSessionUserId();
  const access = await getClubAccess(club, userId);
  if (!can(access, permission)) throw new Error("Not permitted");
  return club;
}

export async function createTournamentAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "events.create");

  const name = String(formData.get("name") ?? "").trim();
  const feeDollars = String(formData.get("fee") ?? "").trim();
  const capacity = String(formData.get("capacity") ?? "").trim();

  const tournament = await createTournament({
    clubId: club.id,
    name,
    slug: slugify(name),
    date: String(formData.get("date") ?? ""),
    format: (String(formData.get("format") ?? "strokePlay") as EventFormat),
    description: String(formData.get("description") ?? "").trim() || undefined,
    capacity: capacity ? Number(capacity) : null,
    // Only meaningful when the club takes payment; the form omits it otherwise.
    entryFeeCents: feeDollars ? Math.round(Number(feeDollars) * 100) : null,
  });

  revalidatePath(`${basePath}/admin/tournaments`);
  redirect(`${basePath}/admin/tournaments/${tournament.slug}`);
}

export async function createLeagueAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "events.create");

  const name = String(formData.get("name") ?? "").trim();
  const league = await createLeague({
    clubId: club.id,
    name,
    slug: slugify(name),
    dayOfWeek: String(formData.get("dayOfWeek") ?? "Thursday"),
    startsOn: String(formData.get("startsOn") ?? ""),
    endsOn: String(formData.get("endsOn") ?? ""),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });

  revalidatePath(`${basePath}/admin/leagues`);
  redirect(`${basePath}/admin/leagues`);
}

/**
 * Feature toggles.
 *
 * Turning a feature off here is what makes it disappear from event setup, from
 * navigation and from the public site - the club says once that it doesn't do
 * something, and Divotz stops asking.
 */
export async function updateFeaturesAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.manage");

  const features = { ...club.features };
  for (const key of Object.keys(features) as ClubFeature[]) {
    features[key] = formData.get(`feature.${key}`) === "on";
  }

  const patch: Parameters<typeof updateClub>[1] = { features };

  // Club defaults have to stay consistent with what the club has turned off,
  // or events would inherit a default the club can't honour.
  const defaults = { ...club.defaults };
  if (!features.onlinePayments) defaults.payment = "none";
  if (!features.onlineRegistration) defaults.registration = "staffManaged";
  if (!features.partnerRequests) defaults.partnerRequests = false;
  if (!features.liveLeaderboards) defaults.leaderboard = "off";
  patch.defaults = defaults;

  // Navigation follows too: a club with leagues off has no Leagues link.
  if (!features.leagues) {
    patch.navigation = club.navigation.filter((item) => item !== "leagues");
  } else if (!club.navigation.includes("leagues")) {
    patch.navigation = [...club.navigation, "leagues"];
  }

  await updateClub(club.id, patch);
  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/settings?saved=features`);
}

export async function updateDefaultsAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.manage");

  await updateClub(club.id, {
    defaults: {
      ...club.defaults,
      registration: String(formData.get("registration") ?? club.defaults.registration) as RegistrationMode,
      payment: String(formData.get("payment") ?? club.defaults.payment) as PaymentMode,
      partnerRequests: formData.get("partnerRequests") === "on",
    },
  });

  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/settings?saved=defaults`);
}

export async function updateClubProfileAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.manage");

  await updateClub(club.id, {
    name: String(formData.get("name") ?? club.name),
    description: String(formData.get("description") ?? ""),
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    location: String(formData.get("location") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
  });

  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/settings?saved=profile`);
}

export async function updateRulesAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.manage");

  await updateClub(club.id, { rules: String(formData.get("rules") ?? "") });
  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/rules?saved=1`);
}

/**
 * Branding.
 *
 * The logo is saved for any club, on any plan. Colours and typography are only
 * applied for Pro clubs - but they're still *stored*, so a club that moves Pro
 * away and later brings it back finds its colours exactly where it left them.
 */
export async function updateBrandingAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.branding");

  const branding = { ...club.branding };
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  branding.logoUrl = logoUrl || null;
  const iconUrl = String(formData.get("iconUrl") ?? "").trim();
  branding.iconUrl = iconUrl || null;

  if (club.plan === "pro") {
    branding.primaryColor = String(formData.get("primaryColor") ?? "") || null;
    branding.secondaryColor = String(formData.get("secondaryColor") ?? "") || null;
    branding.accentColor = String(formData.get("accentColor") ?? "") || null;
    const hero = String(formData.get("heroImageUrl") ?? "").trim();
    branding.heroImageUrl = hero || null;
  }

  await updateClub(club.id, { branding });
  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/branding?saved=1`);
}

export async function updateNavigationAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug"));
  const basePath = String(formData.get("basePath") ?? "");
  const club = await authorize(clubSlug, "club.manage");

  const candidates = ["home", "tournaments", "leagues", "members", "about", "rules", "contact"] as const;
  const navigation = candidates.filter((item) => formData.get(`nav.${item}`) === "on");

  await updateClub(club.id, { navigation: [...navigation] });
  revalidatePath(basePath || "/", "layout");
  redirect(`${basePath}/admin/settings?saved=navigation`);
}
