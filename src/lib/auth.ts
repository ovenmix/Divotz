/**
 * Sessions.
 *
 * The session is a signed-in user id in a cookie. There is no identity
 * provider wired up yet, so the sign-in screen is an explicit account picker -
 * it says so on the page rather than pretending to check a password. When a
 * real provider lands, only `getSessionUserId` and the two actions below
 * change; nothing that reads `getSession()` has to.
 */

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "./domain/repository";
import type { User, UserId } from "./domain/types";

const COOKIE = "divotz_session";

export async function getSessionUserId(): Promise<UserId | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function getSession(): Promise<User | null> {
  const userId = await getSessionUserId();
  return userId ? getUser(userId) : null;
}

/** For platform pages that genuinely require an account. */
export async function requireSession(returnTo: string): Promise<User> {
  const user = await getSession();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function setSession(userId: UserId) {
  const store = await cookies();
  store.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Where to send someone after they sign in.
 *
 * Only same-origin paths are honoured, so a crafted `?next=//elsewhere` can't
 * turn a club's sign-in page into an open redirect.
 */
export function safeReturnTo(next: string | undefined | null, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
