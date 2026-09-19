import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { countRegistrations, getStandaloneTournamentsForUser } from "@/lib/domain/repository";
import { computeFees, formatMoney } from "@/lib/domain/config";
import {
  PAYMENT_LABELS,
  REGISTRATION_LABELS,
  resolveEventSettings,
} from "@/lib/domain/settings";
import { formatDate } from "@/lib/domain/membership";
import { FORMAT_LABELS, STATUS_LABELS } from "@/lib/domain/format";

/**
 * A standalone tournament's admin.
 *
 * With no club above it, the event *is* its own context - it has no defaults
 * to inherit and answers only to itself.
 */
export default async function StandaloneTournament({
  params,
}: {
  params: Promise<{ tournament: string }>;
}) {
  const { tournament: slug } = await params;
  const user = await requireSession(`/dashboard/tournaments/${slug}`);
  const tournaments = await getStandaloneTournamentsForUser(user.id);
  const event = tournaments.find((t) => t.slug === slug);
  if (!event) notFound();

  const settings = resolveEventSettings(null, event);
  const registered = await countRegistrations(event.id);
  const fees =
    event.entryFeeCents && settings.payment.value === "divotzCheckout"
      ? computeFees(event.entryFeeCents, "divotzCheckout")
      : null;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: event.name },
        ]}
        title={event.name}
        description={`${formatDate(event.date)} · ${FORMAT_LABELS[event.format]}`}
        actions={<StatusPill tone="neutral" icon={false}>{STATUS_LABELS[event.status]}</StatusPill>}
      />

      <div className="mb-7">
        <Callout tone="info" title="This tournament isn't run by a club">
          It has no club defaults to inherit, so everything is set on the event itself. If you
          later attach it to a club, the club becomes its home.
        </Callout>
      </div>

      <SectionLabel>Setup</SectionLabel>
      <Card className="mt-3">
        <CardBody className="space-y-2.5 text-sm">
          <Row label="Players" value={`${registered}${event.capacity ? ` of ${event.capacity}` : ""}`} />
          <Row label="Registration" value={REGISTRATION_LABELS[settings.registration.value]} />
          <Row label="Payment" value={PAYMENT_LABELS[settings.payment.value]} />
          {event.entryFeeCents ? (
            <Row
              label="Entry fee"
              value={
                fees
                  ? `${formatMoney(event.entryFeeCents)} (golfers pay ${formatMoney(fees.totalCents)})`
                  : formatMoney(event.entryFeeCents)
              }
            />
          ) : null}
        </CardBody>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
