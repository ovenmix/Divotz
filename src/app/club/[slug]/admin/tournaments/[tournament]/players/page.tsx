import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { getMembers, getRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import { isActiveMember } from "@/lib/domain/membership";
import { resolveEventSettings } from "@/lib/domain/settings";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Players" };

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const [registrations, members] = await Promise.all([
    getRegistrations(event.id),
    getMembers(club.id),
  ]);
  const settings = resolveEventSettings(club, event);
  const byEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));

  const playing = registrations.filter((r) => r.status !== "cancelled");

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Players"
        description={`${playing.length} on the sheet.`}
        actions={<Button variant="outline" size="sm">Add player</Button>}
      />

      {playing.length === 0 ? (
        <EmptyState {...EMPTY_STATES.players} icon={Users} />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {playing.map((registration) => {
              const member = byEmail.get(registration.email.toLowerCase());
              const active = isActiveMember(member);
              return (
                <li key={registration.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {registration.name}
                    </span>
                    <span className="block truncate text-[13px] text-ink-muted">
                      {registration.email}
                    </span>
                  </span>

                  {/*
                   * Membership is shown because it's the thing that can be
                   * wrong: a members-only event with a lapsed member in the
                   * field is exactly what staff need to catch.
                   */}
                  {member ? (
                    <StatusPill tone={active ? "success" : "danger"}>
                      {active ? "Member" : "Membership expired"}
                    </StatusPill>
                  ) : settings.registration.value === "membersOnly" ? (
                    <StatusPill tone="warning">Not a member</StatusPill>
                  ) : registration.isGuest ? (
                    <StatusPill tone="quiet">Guest</StatusPill>
                  ) : null}

                  {registration.status === "pendingApproval" ? (
                    <StatusPill tone="warning">Needs review</StatusPill>
                  ) : registration.status === "waitlisted" ? (
                    <StatusPill tone="info">Waitlist</StatusPill>
                  ) : registration.status === "pendingPayment" ? (
                    <StatusPill tone="warning">Unpaid</StatusPill>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
