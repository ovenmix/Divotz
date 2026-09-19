import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import {
  PAYMENT_LABELS,
  REGISTRATION_LABELS,
  resolveEventSettings,
} from "@/lib/domain/settings";
import { computeFees, formatMoney } from "@/lib/domain/config";
import { formatDate } from "@/lib/domain/membership";
import { FORMAT_LABELS, STATUS_LABELS } from "@/lib/domain/format";

export default async function TournamentAdminOverview({
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
  const [registered, registrations] = await Promise.all([
    countRegistrations(event.id),
    getRegistrations(event.id),
  ]);

  const pending = registrations.filter((r) => r.status === "pendingApproval").length;
  const waitlisted = registrations.filter((r) => r.status === "waitlisted").length;
  const fees =
    event.entryFeeCents && settings.payment.value === "divotzCheckout"
      ? computeFees(event.entryFeeCents, "divotzCheckout")
      : null;

  return (
    <>
      <PageHeader
        eyebrow="Tournament"
        title={event.name}
        description={`${formatDate(event.date)}${event.teeTime ? ` · ${event.teeTime}` : ""} · ${FORMAT_LABELS[event.format]}`}
        actions={
          <ButtonLink href={href(`/tournaments/${event.slug}`)} variant="outline" size="sm">
            View public page
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Players" value={`${registered}${event.capacity ? ` / ${event.capacity}` : ""}`} />
        <Stat label="Needs review" value={String(pending)} tone={pending > 0 ? "warning" : undefined} />
        <Stat label="Waitlist" value={String(waitlisted)} />
      </div>

      <section className="mt-8">
        <SectionLabel>How this event is set up</SectionLabel>
        <Card className="mt-3">
          <CardBody className="space-y-3 text-sm">
            <Row
              label="Registration"
              value={REGISTRATION_LABELS[settings.registration.value]}
              note={
                settings.registration.overridden
                  ? `Overrides the club default (${REGISTRATION_LABELS[settings.registration.clubDefault]})`
                  : "Inherited from the club"
              }
              overridden={settings.registration.overridden}
            />
            {settings.payment.value !== "none" || club.features.onlinePayments ? (
              <Row
                label="Payment"
                value={PAYMENT_LABELS[settings.payment.value]}
                note={
                  settings.payment.overridden
                    ? `Overrides the club default (${PAYMENT_LABELS[settings.payment.clubDefault]})`
                    : "Inherited from the club"
                }
                overridden={settings.payment.overridden}
              />
            ) : null}
            {event.entryFeeCents ? (
              <Row
                label="Entry fee"
                value={formatMoney(event.entryFeeCents)}
                note={fees ? `Golfers pay ${formatMoney(fees.totalCents)} including the Divotz fee` : undefined}
              />
            ) : null}
            <Row label="Status" value={STATUS_LABELS[event.status]} />
          </CardBody>
        </Card>
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <Card>
      <CardBody>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
        <p
          className={`mt-1.5 text-2xl font-semibold tabular-nums ${tone === "warning" ? "text-warning-800" : "text-ink"}`}
        >
          {value}
        </p>
      </CardBody>
    </Card>
  );
}

function Row({
  label,
  value,
  note,
  overridden,
}: {
  label: string;
  value: string;
  note?: string;
  overridden?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right">
        <span className="font-medium text-ink">{value}</span>
        {note ? (
          <span className="mt-0.5 block text-[12px] text-ink-subtle">
            {overridden ? <StatusPill tone="warning" icon={false} className="mr-1.5">Override</StatusPill> : null}
            {note}
          </span>
        ) : null}
      </span>
    </div>
  );
}
