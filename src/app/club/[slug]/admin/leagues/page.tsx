import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getLeagues } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { formatDate } from "@/lib/domain/membership";
import { STATUS_LABELS } from "@/lib/domain/format";
import { AccessDenied } from "@/components/club/access-denied";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Leagues" };

export default async function AdminLeagues({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath, denied } = await requireClubPermission(slug, "events.view");
  // Leagues off at the club level means there is no leagues admin, full stop.
  if (!club.features.leagues) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const leagues = await getLeagues(club.id);

  return (
    <>
      <PageHeader
        title="Leagues"
        description="Recurring events, run week after week."
        actions={
          can(access, "events.create") ? (
            <ButtonLink href={href("/admin/leagues/new")}>Create league</ButtonLink>
          ) : null
        }
      />
      {leagues.length === 0 ? (
        <EmptyState
          {...EMPTY_STATES.leagues}
          icon={CalendarDays}
          action={
            can(access, "events.create") ? (
              <ButtonLink href={href("/admin/leagues/new")}>Create league</ButtonLink>
            ) : null
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {leagues.map((league) => (
              <li key={league.id}>
                <Link
                  href={href(`/leagues/${league.slug}`)}
                  className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cream-500/60 transition-colors"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{league.name}</span>
                    <span className="block text-[13px] text-ink-muted">
                      {league.dayOfWeek}s · {formatDate(league.startsOn)} to {formatDate(league.endsOn)}
                    </span>
                  </span>
                  <StatusPill tone={league.status === "inProgress" ? "success" : "neutral"}>
                    {STATUS_LABELS[league.status]}
                  </StatusPill>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
