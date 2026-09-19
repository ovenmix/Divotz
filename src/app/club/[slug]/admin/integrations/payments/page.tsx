import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { SettingGroup, SettingRow } from "@/components/ui/setting";
import { Toggle, RadioCard } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { getPayments } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { formatMoney, formatRate, PLATFORM } from "@/lib/domain/config";
import { PAYMENT_DESCRIPTIONS, PAYMENT_LABELS } from "@/lib/domain/settings";
import { updateFeaturesAction } from "@/app/club/[slug]/admin/actions";

export const metadata = { title: "Payments" };

/**
 * Payments.
 *
 * One switch decides whether online payment exists for this club at all. With
 * it off, payment vanishes from event setup, from registration and from the
 * event sidebar - the club says "we don't do that" once, and is not asked
 * again per tournament.
 *
 * With it on, the club still chooses whether Divotz handles the money or the
 * club collects it its own way. Supporting payments is not a reason to push
 * every club through our checkout.
 */
export default async function PaymentsIntegration({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { club, access, basePath, denied } = await requireClubPermission(slug, "club.integrations");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const payments = can(access, "payments.view") ? await getPayments(club.id) : [];
  const collected = payments
    .filter((p) => p.status === "paid" || p.status === "partiallyRefunded")
    .reduce((sum, p) => sum + p.amountCents - p.refundedCents, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Whether Divotz collects money for your events, and how."
      />

      <form action={updateFeaturesAction}>
        <input type="hidden" name="clubSlug" value={slug} />
        <input type="hidden" name="basePath" value={basePath} />
        {/* Preserve every other feature flag while toggling this one. */}
        {Object.entries(club.features)
          .filter(([key]) => key !== "onlinePayments")
          .map(([key, value]) =>
            value ? <input key={key} type="hidden" name={`feature.${key}`} value="on" /> : null,
          )}

        <SettingGroup title="Online payments">
          <SettingRow
            label="Online payments"
            description="Allow Divotz to collect tournament entry fees."
            consequence="When off, tournaments won't offer online payment and payment setup disappears from event creation entirely."
            control={
              <Toggle
                name="feature.onlinePayments"
                defaultChecked={club.features.onlinePayments}
                label="Online payments"
              />
            }
          />
        </SettingGroup>

        <div className="-mt-4 mb-8">
          <Button type="submit" variant="outline" size="sm">
            Save
          </Button>
        </div>
      </form>

      {club.features.onlinePayments ? (
        <>
          <section className="mb-8">
            <SectionLabel>Default payment method</SectionLabel>
            <p className="mt-1 mb-3 max-w-2xl text-sm text-ink-muted">
              What new events use. An organiser can choose differently for a particular event.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <RadioCard
                name="defaultPayment"
                value="clubDirect"
                title={PAYMENT_LABELS.clubDirect}
                description={PAYMENT_DESCRIPTIONS.clubDirect}
                defaultChecked={club.defaults.payment === "clubDirect"}
              />
              <RadioCard
                name="defaultPayment"
                value="divotzCheckout"
                title={PAYMENT_LABELS.divotzCheckout}
                description={PAYMENT_DESCRIPTIONS.divotzCheckout}
                defaultChecked={club.defaults.payment === "divotzCheckout"}
              />
            </div>
          </section>

          <section className="mb-8">
            <SectionLabel>What Divotz charges</SectionLabel>
            <Card className="mt-3">
              <CardBody>
                <p className="text-sm text-ink leading-relaxed">
                  Your club receives the entry fee. Divotz adds a{" "}
                  <strong>{formatRate(PLATFORM.serviceFeeRate)}</strong> service fee on top, paid by
                  the golfer, with a minimum of {formatMoney(PLATFORM.serviceFeeMinimumCents)} and a
                  maximum of {formatMoney(PLATFORM.serviceFeeMaximumCents)}.
                </p>
                <p className="mt-3 text-[13px] text-ink-muted">
                  The fee is shown to golfers before they pay, never at the last step.
                </p>
              </CardBody>
            </Card>
          </section>

          {can(access, "payments.view") ? (
            <section>
              <SectionLabel>Collected to date</SectionLabel>
              <Card className="mt-3">
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-2xl font-semibold text-ink tabular-nums">
                    {formatMoney(collected)}
                  </p>
                  <StatusPill tone="success">{payments.length} payments</StatusPill>
                </CardBody>
              </Card>
            </section>
          ) : null}
        </>
      ) : (
        <Callout tone="info" title="Payments are off for this club">
          Tournaments will collect registrations without mentioning payment. Nobody running an event
          will be asked to configure or switch off payment - it simply isn&apos;t part of your setup.
        </Callout>
      )}
    </>
  );
}
