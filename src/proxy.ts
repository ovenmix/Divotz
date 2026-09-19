/**
 * Subdomain routing.
 *
 * gleniffer-golf.divotz.ca/tournaments/mens-night
 *   -> internally /club/gleniffer-golf/tournaments/mens-night
 *
 * The rewrite is invisible: the address bar keeps the club's own URL, because
 * the club URL *is* the product. Nobody should have to remember to go to
 * divotz.ca first and drill down to their club.
 *
 * A Pro club on a custom domain resolves the same way - the club is identified
 * from the host, and every route below it is unchanged.
 *
 * Local development has no wildcard DNS, so `?club=` and the
 * `<slug>.localhost` form both work for driving the club experience.
 */

import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_DIVOTZ_ROOT_DOMAIN ?? "divotz.ca";

/** Hostnames that are the platform itself, never a club. */
const RESERVED = new Set(["www", "app", "api", "admin", "assets", "static"]);

function clubSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const label = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (!label || label.includes(".") || RESERVED.has(label)) return null;
    return label;
  }

  // <slug>.localhost, so the club experience is reachable in development.
  if (hostname.endsWith(".localhost")) {
    const label = hostname.slice(0, -".localhost".length);
    return label && !RESERVED.has(label) ? label : null;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // `?club=` is a development affordance only; it never appears in production
  // URLs, where the host alone identifies the club.
  const slug = clubSlugFromHost(host) ?? url.searchParams.get("club");

  const headers = new Headers(request.headers);
  /*
   * The URL the visitor actually typed, before any rewrite. Pages read this to
   * build a correct `?next=` when they have to ask someone to sign in, so the
   * return trip lands on the club URL rather than the internal one.
   */
  headers.set("x-divotz-path", url.pathname + url.search);

  if (!slug) return NextResponse.next({ request: { headers } });

  headers.set("x-divotz-club", slug);

  // Already an internal club path (an internal redirect bouncing through).
  if (url.pathname.startsWith("/club/")) {
    return NextResponse.next({ request: { headers } });
  }

  const rewritten = url.clone();
  rewritten.pathname = `/club/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(rewritten, { request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static files. Club routing has to
     * apply to the bare "/" of a club host, so no path prefix can be assumed.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
