import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getTournaments } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { formatDate } from "@/lib/domain/membership";
import { STATUS_LABELS } from "@/lib/domain/format";
import { REGISTRATION_LABELS, resolveEventSettings } from "@/lib/domain/settings";
import { AccessDenied } from "@/components/club/access-denied";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Tournaments" };

export default async function AdminTournaments({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath, denied } = await requireClubPermission(slug, "events.view");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const tournaments = await getTournaments(club.id);
  const rows = await Promise.all(
    tournaments.map(async (tournament) => ({
      tournament,
      registered: await countRegistrations(tournament.id),
      settings: resolveEventSettings(club, tournament),
    })),
  );

  return (
    <>
      <PageHeader
        title="Tournaments"
        description="Everything the club runs, past and upcoming."
        actions={
          can(access, "events.create") ? (
            /*
             * Creating a tournament happens here, inside the club. It does not
             * send anybody back out to a platform dashboard to do it.
             */
            <ButtonLink href={href("/admin/tournaments/new")}>Create tournament</ButtonLink>
          ) : null
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          {...EMPTY_STATES.tournaments}
          icon={Trophy}
          action={
            can(access, "events.create") ? (
              <ButtonLink href={href("/admin/tournaments/new")}>Create tournament</ButtonLink>
            ) : null
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {rows.map(({ tournament, registered, settings }) => (
              <li key={tournament.id}>
                <Link
                  href={href(`/admin/tournaments/${tournament.slug}`)}
                  className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cream-500/60 transition-colors"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {tournament.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-muted">
                      {formatDate(tournament.date)} · {registered}
                      {tournament.capacity ? `/${tournament.capacity}` : ""} players ·{" "}
                      {REGISTRATION_LABELS[settings.registration.value]}
                      {settings.registration.overridden ? " (override)" : ""}
                    </span>
                  </span>
                  <StatusPill
                    tone={
                      tournament.status === "open"
                        ? "success"
                        : tournament.status === "draft"
                          ? "quiet"
                          : "neutral"
                    }
                  >
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
