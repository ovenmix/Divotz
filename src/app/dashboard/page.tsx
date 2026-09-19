import Link from "next/link";
import { ArrowUpRight, Building2, Plus, Trophy } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getClubsForUser, getStandaloneTournamentsForUser } from "@/lib/domain/repository";
import { clubUrl } from "@/lib/club-request";
import { formatDate } from "@/lib/domain/membership";
import { ClubMark } from "@/components/club/club-mark";
import { ClubTheme } from "@/components/club/club-theme";

/**
 * "What Divotz things do I own or belong to?"
 *
 * That's the whole job. This is not a workspace and not a control panel -
 * club administration happens inside the club, at the club's own URL. What
 * lives here is what sits *above* a club: creating one, standing up a
 * tournament with no club behind it, and the account itself.
 */
export default async function Dashboard() {
  const user = await requireSession("/dashboard");
  const [clubs, standalone] = await Promise.all([
    getClubsForUser(user.id),
    getStandaloneTournamentsForUser(user.id),
  ]);

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}.`}
        description="Your clubs and tournaments on Divotz."
      />

      <section className="mb-9">
        <SectionLabel>Your clubs</SectionLabel>
        <div className="mt-3 space-y-3">
          {clubs.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-ink-muted">
                  You&apos;re not part of a club yet. Create one and it gets its own site.
                </p>
              </CardBody>
            </Card>
          ) : (
            clubs.map(({ club, relationship }) => (
              /*
               * Each row is themed as its own club, so this list looks like
               * the clubs it links to rather than like a generic SaaS table.
               */
              <ClubTheme key={club.id} club={club}>
                <Card>
                  <CardBody className="flex flex-wrap items-center gap-4">
                    <ClubMark club={club} size={44} />
                    <div className="min-w-0 flex-1">
                      {/* The club's own URL is the destination, always. */}
                      <Link
                        href={`/club/${club.slug}`}
                        className="text-sm font-semibold text-ink hover:underline underline-offset-2"
                      >
                        {club.name}
                      </Link>
                      <p className="mt-0.5 truncate text-[13px] text-ink-muted">
                        {clubUrl(club.slug).replace("https://", "")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {club.plan === "pro" ? <StatusPill tone="quiet">Pro</StatusPill> : null}
                      <StatusPill tone="neutral" icon={false}>
                        {relationship === "owner"
                          ? "Owner"
                          : relationship === "staff"
                            ? "Staff"
                            : "Member"}
                      </StatusPill>
                      <Link
                        href={`/club/${club.slug}`}
                        aria-label={`Open ${club.name}`}
                        className="rounded-lg p-2 text-ink-muted hover:bg-cream-500 hover:text-ink transition-colors"
                      >
                        <ArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </ClubTheme>
            ))
          )}
        </div>
      </section>

      <section className="mb-9">
        <SectionLabel>Your tournaments</SectionLabel>
        <p className="mt-1 mb-3 text-[13px] text-ink-muted">
          One-off events that don&apos;t belong to a club.
        </p>
        <div className="space-y-3">
          {standalone.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-ink-muted">
                  Nothing standalone. Tournaments run by a club live inside that club.
                </p>
              </CardBody>
            </Card>
          ) : (
            standalone.map((tournament) => (
              <Card key={tournament.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/tournaments/${tournament.slug}`}
                      className="text-sm font-semibold text-ink hover:underline underline-offset-2"
                    >
                      {tournament.name}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-ink-muted">
                      {formatDate(tournament.date)}
                    </p>
                  </div>
                  <StatusPill tone="neutral" icon={false}>
                    Standalone
                  </StatusPill>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="rule-scorecard pt-6">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/create-club" variant="outline">
            <Building2 className="size-4" aria-hidden />
            Create a club
          </ButtonLink>
          <ButtonLink href="/dashboard/create-tournament" variant="outline">
            <Trophy className="size-4" aria-hidden />
            Create a tournament
          </ButtonLink>
        </div>
        <p className="mt-3 text-[13px] text-ink-subtle">
          Running an event for a club you already have? Create it inside that club - it&apos;ll
          inherit how the club normally does things.
        </p>
      </section>
    </>
  );
}
