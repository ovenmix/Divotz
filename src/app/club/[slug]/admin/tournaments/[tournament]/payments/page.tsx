import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { AccessDenied } from "@/components/club/access-denied";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getPayments, getTournamentBySlug } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { formatMoney } from "@/lib/domain/config";
import { resolveEventSettings, PAYMENT_LABELS } from "@/lib/domain/settings";
import { formatDate } from "@/lib/domain/membership";

export const metadata = { title: "Payments" };

/**
 * Event payments.
 *
 * Gated on an explicit financial permission, so a volunteer who helps sort
 * groups cannot see what the club took in. Refunds need a further permission
 * again, because reversing money is not the same job as reading a list.
 */
export default async function EventPayments({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  if (!can(access, "payments.view")) {
    return <AccessDenied clubName={club.name} homeHref={href("/admin")} />;
  }

  const settings = resolveEventSettings(club, event);
  const payments = (await getPayments(club.id)).filter((p) => p.tournamentId === event.id);

  const collected = payments
    .filter((p) => p.status === "paid" || p.status === "partiallyRefunded")
    .reduce((sum, p) => sum + p.amountCents - p.refundedCents, 0);
  const fees = payments.reduce((sum, p) => sum + p.feeCents, 0);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Payments"
        description={PAYMENT_LABELS[settings.payment.value]}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Collected for the club
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">
              {formatMoney(collected)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Divotz service fees
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">{formatMoney(fees)}</p>
            <p className="mt-1 text-[13px] text-ink-muted">Paid by golfers on top of the entry fee.</p>
          </CardBody>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-ink-muted">No payments recorded for this event yet.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">{payment.method ?? "Card"}</span>
                  <span className="block text-[13px] text-ink-muted">
                    {payment.paidAt ? formatDate(payment.paidAt) : "Not paid"} ·{" "}
                    {formatMoney(payment.amountCents)} entry + {formatMoney(payment.feeCents)} fee
                  </span>
                </span>
                <span className="text-sm font-medium text-ink tabular-nums">
                  {formatMoney(payment.totalCents)}
                </span>
                <StatusPill
                  tone={
                    payment.status === "paid"
                      ? "success"
                      : payment.status === "refunded" || payment.status === "partiallyRefunded"
                        ? "info"
                        : "warning"
                  }
                >
                  {payment.status === "partiallyRefunded" ? "Partly refunded" : payment.status}
                </StatusPill>
                {can(access, "payments.refund") && payment.status === "paid" ? (
                  <Button size="sm" variant="outline">
                    Refund
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
