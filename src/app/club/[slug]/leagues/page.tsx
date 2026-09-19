import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getLeagues } from "@/lib/domain/repository";
import { formatDate } from "@/lib/domain/membership";
import { STATUS_LABELS } from "@/lib/domain/format";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Leagues" };

export default async function ClubLeagues({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath } = await resolveClub(slug);

  // A club that doesn't run leagues has no leagues page at all - not an empty
  // one telling them about a feature they've switched off.
  if (!club.features.leagues) notFound();

  const leagues = await getLeagues(club.id);
  const href = (path: string) => joinClubPath(basePath, path);

  return (
    <ClubShell>
      <PageHeader title="Leagues" description="The weekly stuff, and where everyone stands." />
      {leagues.length === 0 ? (
        <EmptyState {...EMPTY_STATES.leagues} icon={CalendarDays} />
      ) : (
        <ul className="space-y-3">
          {leagues.map((league) => (
            <Card as="li" key={league.id} className="transition-shadow hover:shadow-pop">
              <Link href={href(`/leagues/${league.slug}`)}>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-ink">{league.name}</h2>
                      <p className="mt-1 text-[13px] text-ink-muted">
                        {league.dayOfWeek}s · {formatDate(league.startsOn)} to {formatDate(league.endsOn)}
                      </p>
                    </div>
                    <StatusPill tone={league.status === "inProgress" ? "success" : "neutral"}>
                      {STATUS_LABELS[league.status]}
                    </StatusPill>
                  </div>
                  {league.description ? (
                    <p className="mt-3 text-sm text-ink-muted leading-relaxed">{league.description}</p>
                  ) : null}
                </CardBody>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </ClubShell>
  );
}
