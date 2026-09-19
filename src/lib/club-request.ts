/**
 * Server-side club resolution.
 *
 * Works out which club a request is for, who is looking at it, and what they
 * are allowed to do - once per request, so pages don't each re-derive it.
 */

import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getClubAccess, getClubBySlug } from "./domain/repository";
import { getSession } from "./auth";
import { can, type ClubAccess } from "./domain/permissions";
import type { Club, Permission, User } from "./domain/types";

export type ClubRequest = {
  club: Club;
  user: User | null;
  access: ClubAccess;
  /** "" when serving a club host, "/club/<slug>" on the path form. */
  basePath: string;
  /** The URL the visitor is actually on, before any internal rewrite. */
  currentPath: string;
};

export async function resolveClub(slug: string): Promise<ClubRequest> {
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const [user, headerList] = await Promise.all([getSession(), headers()]);
  const access = await getClubAccess(club, user?.id ?? null);

  // The middleware sets this header only when it rewrote from a club host, so
  // its presence is exactly the signal for which URL form to emit.
  const onClubHost = headerList.get("x-divotz-club") === slug;

  return {
    club,
    user,
    access,
    basePath: onClubHost ? "" : `/club/${slug}`,
    currentPath: headerList.get("x-divotz-path") ?? (onClubHost ? "/" : `/club/${slug}`),
  };
}

/**
 * Guard an admin route.
 *
 * A signed-out visitor who deep-linked to /admin/tournaments is sent to the
 * *club's* sign-in and returned to /admin/tournaments once they're in - not
 * dumped on the platform dashboard. Someone signed in without the permission
 * gets an honest answer instead of a redirect loop.
 */
export async function requireClubPermission(
  slug: string,
  permission: Permission,
): Promise<ClubRequest & { denied: boolean }> {
  const request = await resolveClub(slug);

  if (!request.access.signedIn) {
    const next = encodeURIComponent(request.currentPath);
    redirect(`${request.basePath}/sign-in?next=${next}`);
  }

  return { ...request, denied: !can(request.access, permission) };
}

/** Absolute, shareable club URL - for emails, QR codes and "copy link". */
export function clubUrl(slug: string, path = "/"): string {
  const root = process.env.NEXT_PUBLIC_DIVOTZ_ROOT_DOMAIN ?? "divotz.ca";
  return `https://${slug}.${root}${path === "/" ? "" : path}`;
}
