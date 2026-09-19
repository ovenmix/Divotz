import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getMembers, getRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import { isActiveMember } from "@/lib/domain/membership";
import {
  REGISTRATION_DESCRIPTIONS,
  REGISTRATION_LABELS,
  resolveEventSettings,
} from "@/lib/domain/settings";
import { InheritanceNote } from "@/components/ui/setting";

export const metadata = { title: "Registration" };

export default async function RegistrationAdmin({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, basePath } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  const settings = resolveEventSettings(club, event);
  const [registrations, members] = await Promise.all([
    getRegistrations(event.id),
    getMembers(club.id),
  ]);
  const byEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));
  const pending = registrations.filter((r) => r.status === "pendingApproval");

  return (
    <>
      <PageHeader eyebrow={event.name} title="Registration" />

      <Card className="mb-7">
        <CardBody>
          <p className="text-sm font-medium text-ink">
            {REGISTRATION_LABELS[settings.registration.value]}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            {REGISTRATION_DESCRIPTIONS[settings.registration.value]}
          </p>
          <InheritanceNote
            clubDefault={REGISTRATION_LABELS[settings.registration.clubDefault]}
            overridden={settings.registration.overridden}
            settingsHref={href("/admin/settings")}
          />
        </CardBody>
      </Card>

      <section>
        <SectionLabel>Waiting on you</SectionLabel>
        {pending.length === 0 ? (
          <Card className="mt-3">
            <CardBody>
              <p className="text-sm text-ink-muted">
                Nothing to review. Everyone who&apos;s signed up is confirmed.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((registration) => {
              const member = byEmail.get(registration.email.toLowerCase());
              const active = isActiveMember(member);
              return (
                <Card key={registration.id}>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{registration.name}</p>
                      <p className="text-[13px] text-ink-muted">{registration.email}</p>
                      {/* Say why it's here, so the decision is one click of thought. */}
                      {member && !active ? (
                        <p className="mt-1.5 text-[13px] text-danger-800">
                          Membership expired {member.expiresAt}. This event is members only.
                        </p>
                      ) : !member ? (
                        <p className="mt-1.5 text-[13px] text-warning-800">
                          No membership on file at {club.name}.
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill tone="warning">Needs review</StatusPill>
                      <Button size="sm" variant="outline">Decline</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {settings.registration.value === "inviteOnly" ? (
        <div className="mt-7">
          <Callout tone="info" title="Invitations">
            Only people you invite can register. Invite links carry their own access - send them
            from Communications.
          </Callout>
        </div>
      ) : null}
    </>
  );
}
