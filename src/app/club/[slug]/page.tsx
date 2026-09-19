import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { EventCard, eventFeeLabel } from "@/components/club/event-card";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getLeagues, getTournaments } from "@/lib/domain/repository";
import { registrationAvailability, resolveEventSettings } from "@/lib/domain/settings";
import { effectiveHeroImage } from "@/lib/domain/branding";
import { formatDate } from "@/lib/domain/membership";
import { ClubMark } from "@/components/club/club-mark";

/**
 * The club's home page.
 *
 * Assembled from what the club already has - upcoming events, the league in
 * progress, the welcome message - so a club gets a living home page without
 * anybody building one. It is the club's front page, not an admin dashboard:
 * no counts of things needing attention, no staff tooling.
 */
export default async function ClubHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  const [tournaments, leagues] = await Promise.all([
    getTournaments(club.id),
    club.features.leagues ? getLeagues(club.id) : Promise.resolve([]),
  ]);

  const upcoming = tournaments
    .filter((t) => t.status !== "draft" && t.status !== "cancelled")
    .slice(0, 3);

  const cards = await Promise.all(
    upcoming.map(async (tournament) => {
      const settings = resolveEventSettings(club, tournament);
      const registered = await countRegistrations(tournament.id);
      return {
        tournament,
        registered,
        availability: registrationAvailability(settings.registration.value, {
          signedIn: access.signedIn,
          isActiveMember: access.isMember,
          isStaff: access.isStaff,
        }, { registered, capacity: tournament.capacity }),
        feeLabel: eventFeeLabel(tournament, settings.payment.value !== "none"),
      };
    }),
  );

  const hero = effectiveHeroImage(club);
  const activeLeague = leagues.find((league) => league.status === "inProgress") ?? leagues[0];

  return (
    <ClubShell bleed>
      <section className="relative overflow-hidden border-b border-line">
        {hero ? (
          <>
            <Image
              src={hero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* Scrim so the welcome copy stays readable over any photograph. */}
            <div className="absolute inset-0 bg-grey-900/55" />
          </>
        ) : (
          <div className="absolute inset-0 club-primary-bg" />
        )}

        <div className="relative px-5 py-14 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <ClubMark club={club} size={44} className="bg-white/15" />
              <p
                className="text-[13px] font-medium uppercase tracking-[0.1em]"
                style={{ color: hero ? "#FCFBF7" : "var(--club-primary-foreground)" }}
              >
                {club.location ?? "Golf club"}
              </p>
            </div>
            <h1
              className="mt-5 max-w-2xl text-3xl font-semibold lg:text-5xl"
              style={{ color: hero ? "#FCFBF7" : "var(--club-primary-foreground)" }}
            >
              {club.name}
            </h1>
            {club.welcomeMessage ? (
              <p
                className="mt-4 max-w-xl text-base leading-relaxed opacity-90"
                style={{ color: hero ? "#FCFBF7" : "var(--club-primary-foreground)" }}
              >
                {club.welcomeMessage}
              </p>
            ) : null}
            {cards.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink
                  href={href(`/tournaments/${cards[0].tournament.slug}`)}
                  size="lg"
                  className="bg-surface-raised text-ink hover:bg-cream-500"
                >
                  Ready for tee-off? {cards[0].tournament.name}
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="px-5 py-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-10">
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <SectionLabel>Upcoming</SectionLabel>
              {club.features.publicTournaments ? (
                <Link
                  href={href("/tournaments")}
                  className="text-[13px] text-ink-muted hover:text-ink transition-colors"
                >
                  All tournaments
                </Link>
              ) : null}
            </div>

            {cards.length === 0 ? (
              <EmptyState
                headline="Nothing on the sheet just yet."
                body="There are no upcoming events at the moment. Check back soon."
                icon={Trophy}
              />
            ) : (
              <ul className="space-y-3">
                {cards.map((card) => (
                  <EventCard
                    key={card.tournament.id}
                    tournament={card.tournament}
                    href={href(`/tournaments/${card.tournament.slug}`)}
                    availability={card.availability}
                    registered={card.registered}
                    feeLabel={card.feeLabel}
                  />
                ))}
              </ul>
            )}
          </section>

          {activeLeague ? (
            <section>
              <SectionLabel>League</SectionLabel>
              <Card className="mt-3">
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">{activeLeague.name}</h3>
                      {activeLeague.status === "inProgress" ? (
                        <StatusPill tone="success">In progress</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {activeLeague.dayOfWeek}s · through {formatDate(activeLeague.endsOn)}
                    </p>
                  </div>
                  <ButtonLink href={href(`/leagues/${activeLeague.slug}`)} variant="outline" size="sm">
                    Standings
                  </ButtonLink>
                </CardBody>
              </Card>
            </section>
          ) : null}

          {club.description ? (
            <section>
              <SectionLabel>About the club</SectionLabel>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                {club.description}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </ClubShell>
  );
}
