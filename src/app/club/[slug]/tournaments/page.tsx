import { Trophy } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { EventCard, eventFeeLabel } from "@/components/club/event-card";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getTournaments } from "@/lib/domain/repository";
import { registrationAvailability, resolveEventSettings } from "@/lib/domain/settings";

export const metadata = { title: "Tournaments" };

export default async function ClubTournaments({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  const all = await getTournaments(club.id);
  // Drafts are the club's business, not the public's.
  const visible = all.filter((t) => (access.isStaff ? true : t.status !== "draft"));

  const cards = await Promise.all(
    visible.map(async (tournament) => {
      const settings = resolveEventSettings(club, tournament);
      const registered = await countRegistrations(tournament.id);
      return {
        tournament,
        registered,
        feeLabel: eventFeeLabel(tournament, settings.payment.value !== "none"),
        availability: registrationAvailability(
          settings.registration.value,
          { signedIn: access.signedIn, isActiveMember: access.isMember, isStaff: access.isStaff },
          { registered, capacity: tournament.capacity },
        ),
      };
    }),
  );

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = cards.filter((c) => c.tournament.date >= now);
  const past = cards.filter((c) => c.tournament.date < now);

  return (
    <ClubShell>
      <PageHeader
        title="Tournaments"
        description={`Everything on the calendar at ${club.name}.`}
      />

      {cards.length === 0 ? (
        <EmptyState
          headline="No tournaments yet."
          body="The tee sheet is looking suspiciously empty. Check back soon."
          icon={Trophy}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((card) => (
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
          ) : null}

          {past.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Played
              </h2>
              <ul className="space-y-3 opacity-80">
                {past.map((card) => (
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
            </section>
          ) : null}
        </div>
      )}
    </ClubShell>
  );
}
