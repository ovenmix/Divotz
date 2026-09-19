/**
 * Club URL joining.
 *
 * Lives on its own, with no "use client", because both server components and
 * client components need it. The same page is reachable two ways:
 *
 *   gleniffer-golf.divotz.ca/tournaments      (canonical - basePath "")
 *   divotz.ca/club/gleniffer-golf/tournaments (direct/fallback)
 *
 * The canonical form is what a club publishes. The fallback exists so the app
 * works where wildcard DNS doesn't, and so deep links never 404.
 */
export function joinClubPath(basePath: string, path: string): string {
  const suffix = path === "/" ? "" : path;
  const joined = `${basePath}${suffix}`;
  return joined === "" ? "/" : joined;
}
