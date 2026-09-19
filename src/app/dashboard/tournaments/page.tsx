import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getStandaloneTournamentsForUser } from "@/lib/domain/repository";
import { formatDate } from "@/lib/domain/membership";
import { STATUS_LABELS } from "@/lib/domain/format";

export const metadata = { title: "Tournaments" };

/**
 * Standalone tournaments.
 *
 * The main reason the platform dashboard needs to exist at all: an event with
 * no club behind it has nowhere else to live. A tournament that belongs to a
 * club is managed inside that club, not here.
 */
export default async function DashboardTournaments() {
  const user = await requireSession("/dashboard/tournaments");
  const tournaments = await getStandaloneTournamentsForUser(user.id);

  return (
    <>
      <PageHeader
        title="Your tournaments"
        description="One-off events that aren't run by a club."
        actions={<ButtonLink href="/dashboard/create-tournament">Create tournament</ButtonLink>}
      />
      {tournaments.length === 0 ? (
        <EmptyState
          headline="No standalone tournaments."
          body="A charity scramble, a corporate day, a one-off with friends - anything that doesn't need a whole club behind it."
          icon={Trophy}
          action={<ButtonLink href="/dashboard/create-tournament">Create tournament</ButtonLink>}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link
                  href={`/dashboard/tournaments/${tournament.slug}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cream-500/60 transition-colors"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{tournament.name}</span>
                    <span className="block text-[13px] text-ink-muted">
                      {formatDate(tournament.date)}
                    </span>
                  </span>
                  <StatusPill tone={tournament.status === "open" ? "success" : "neutral"}>
                    {STATUS_LABELS[tournament.status]}
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
