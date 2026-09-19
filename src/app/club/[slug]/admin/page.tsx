import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarPlus, Trophy, UserPlus } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import {
  countRegistrations,
  getMembers,
  getRegistrations,
  getTournaments,
} from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { expiryState, formatDate } from "@/lib/domain/membership";
import { greeting } from "@/lib/copy";
import { LoadingLine } from "@/components/ui/loading";
import { resolveEventSettings } from "@/lib/domain/settings";
import type { Member, Tournament } from "@/lib/domain/types";

export const metadata = { title: "Overview" };

/**
 * The club's control room.
 *
 * Answers one question - what needs my attention? - rather than showing charts
 * nobody acts on. Everything listed here is a thing somebody has to do.
 */
export default async function AdminOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, user, access, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  const [tournaments, members] = await Promise.all([
    getTournaments(club.id),
    can(access, "people.view") ? getMembers(club.id) : Promise.resolve([]),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = tournaments
    .filter((t) => t.date >= today && t.status !== "cancelled")
    .slice(0, 3);

  const withCounts = await Promise.all(
    upcoming.map(async (tournament) => ({
      tournament,
      registered: await countRegistrations(tournament.id),
    })),
  );

  return (
    <>
      <PageHeader
        eyebrow={club.name}
        title={`${greeting()}${user ? `, ${user.name.split(" ")[0]}` : ""}.`}
        description="Here's what's happening at the club."
      />

      <section className="mb-8">
        <SectionLabel>Upcoming</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {withCounts.length === 0 ? (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardBody>
                <p className="text-sm text-ink-muted">
                  Nothing on the sheet. The course is quiet.
                </p>
              </CardBody>
            </Card>
          ) : (
            withCounts.map(({ tournament, registered }) => {
              const settings = resolveEventSettings(club, tournament);
              const ready = tournament.capacity ? registered >= tournament.capacity * 0.6 : true;
              return (
                <Card key={tournament.id}>
                  <CardBody>
                    <Link
                      href={href(`/admin/tournaments/${tournament.slug}`)}
                      className="text-sm font-semibold text-ink hover:underline underline-offset-2"
                    >
                      {tournament.name}
                    </Link>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {formatDate(tournament.date)}
                      {tournament.teeTime ? ` · ${tournament.teeTime}` : ""}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-muted">
                      <span className="tabular-nums">
                        {registered} {registered === 1 ? "player" : "players"}
                      </span>
                      <StatusPill tone={ready ? "success" : "warning"}>
                        {ready ? "Ready" : "Filling up"}
                      </StatusPill>
                    </p>
                    {settings.registration.overridden ? (
                      <p className="mt-2 text-[12px] text-warning-800">
                        Registration overridden for this event
                      </p>
                    ) : null}
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="mb-8">
        <SectionLabel>Needs attention</SectionLabel>
        <Card className="mt-3">
          <Suspense
            fallback={
              <CardBody>
                <LoadingLine seed={club.slug} />
              </CardBody>
            }
          >
            <NeedsAttention tournaments={tournaments} members={members} href={href} />
          </Suspense>
        </Card>
      </section>

      <section>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {can(access, "events.create") ? (
            <ButtonLink href={href("/admin/tournaments/new")} variant="outline">
              <Trophy className="size-4" aria-hidden />
              Create tournament
            </ButtonLink>
          ) : null}
          {can(access, "events.create") && club.features.leagues ? (
            <ButtonLink href={href("/admin/leagues/new")} variant="outline">
              <CalendarPlus className="size-4" aria-hidden />
              Create league
            </ButtonLink>
          ) : null}
          {can(access, "people.manage") ? (
            <ButtonLink href={href("/admin/members")} variant="outline">
              <UserPlus className="size-4" aria-hidden />
              Add member
            </ButtonLink>
          ) : null}
        </div>
      </section>
    </>
  );
}

/**
 * Everything genuinely waiting on a human.
 *
 * Fans out a query per tournament, so it streams in behind a Suspense
 * boundary rather than holding up the whole overview.
 */
async function NeedsAttention({
  tournaments,
  members,
  href,
}: {
  tournaments: Tournament[];
  members: Member[];
  href: (path: string) => string;
}) {
  const attention: { label: string; href: string }[] = [];

  for (const tournament of tournaments) {
    const registrations = await getRegistrations(tournament.id);

    const pending = registrations.filter((r) => r.status === "pendingApproval").length;
    if (pending > 0) {
      attention.push({
        label: `${pending} ${pending === 1 ? "registration needs" : "registrations need"} review in ${tournament.name}`,
        href: href(`/admin/tournaments/${tournament.slug}/registration`),
      });
    }

    const unpaid = registrations.filter((r) => r.status === "pendingPayment").length;
    if (unpaid > 0) {
      attention.push({
        label: `${unpaid} unpaid ${unpaid === 1 ? "entry" : "entries"} in ${tournament.name}`,
        href: href(`/admin/tournaments/${tournament.slug}/players`),
      });
    }
  }

  const expiring = members.filter((m) => expiryState(m) === "expiringSoon").length;
  if (expiring > 0) {
    attention.push({
      label: `${expiring} ${expiring === 1 ? "membership expires" : "memberships expire"} soon`,
      href: href("/admin/members"),
    });
  }

  const expired = members.filter((m) => expiryState(m) === "expired").length;
  if (expired > 0) {
    attention.push({
      label: `${expired} expired ${expired === 1 ? "membership" : "memberships"}`,
      href: href("/admin/members"),
    });
  }

  const pendingMembers = members.filter((m) => m.status === "pending").length;
  if (pendingMembers > 0) {
    attention.push({
      label: `${pendingMembers} ${pendingMembers === 1 ? "membership request" : "membership requests"}`,
      href: href("/admin/members"),
    });
  }

  if (attention.length === 0) {
    return (
      <CardBody>
        <p className="text-sm text-ink-muted">
          Nothing needs you right now. Everything&apos;s sitting nicely on the short grass.
        </p>
      </CardBody>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {attention.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm text-ink hover:bg-cream-500/60 transition-colors"
          >
            {item.label}
            <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
