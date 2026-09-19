import { notFound } from "next/navigation";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Breadcrumbs, EmptyState } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getLeagueBySlug } from "@/lib/domain/repository";
import { resolveLeagueSettings } from "@/lib/domain/settings";
import { formatDate } from "@/lib/domain/membership";
import { STATUS_LABELS } from "@/lib/domain/format";
import { EMPTY_STATES } from "@/lib/copy";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ slug: string; league: string }>;
}) {
  const { slug, league: leagueSlug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  if (!club.features.leagues) notFound();

  const league = await getLeagueBySlug(club.id, leagueSlug);
  if (!league) notFound();

  const settings = resolveLeagueSettings(club, league);
  const href = (path: string) => joinClubPath(basePath, path);

  // Standings follow the same visibility rules as any other leaderboard.
  const canSeeStandings =
    settings.leaderboard.value === "public" ||
    (settings.leaderboard.value === "participants" && access.signedIn) ||
    (settings.leaderboard.value === "private" && access.isStaff);

  return (
    <ClubShell>
      <Breadcrumbs
        items={[
          { label: club.name, href: href("/") },
          { label: "Leagues", href: href("/leagues") },
          { label: league.name },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{league.name}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {league.dayOfWeek}s · {formatDate(league.startsOn)} to {formatDate(league.endsOn)}
          </p>
        </div>
        <StatusPill tone={league.status === "inProgress" ? "success" : "neutral"}>
          {STATUS_LABELS[league.status]}
        </StatusPill>
      </div>

      {league.description ? (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{league.description}</p>
      ) : null}

      <div className="mt-7">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Standings
        </h2>
        {canSeeStandings ? (
          <Card>
            <CardBody>
              <EmptyState {...EMPTY_STATES.results} />
            </CardBody>
          </Card>
        ) : (
          <p className="text-sm text-ink-muted">
            Standings for this league are visible to {settings.leaderboard.value === "participants" ? "players in the league" : "club staff"}.
          </p>
        )}
      </div>
    </ClubShell>
  );
}
