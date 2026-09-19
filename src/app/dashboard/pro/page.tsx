import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getClubsForUser, getProSubscription } from "@/lib/domain/repository";
import { PLATFORM, PRO_FEATURES, PRO_FEATURE_LABELS, formatMoney } from "@/lib/domain/config";
import { ProClubPicker } from "@/components/dashboard/pro-club-picker";
import { formatDate } from "@/lib/domain/membership";

export const metadata = { title: "Pro" };

/**
 * Pro, at the account level.
 *
 * A subscription belongs to a person and covers up to a fixed number of their
 * clubs. Moving Pro between clubs is therefore an account operation, and it
 * lives here rather than in any one club's admin.
 */
export default async function ProDashboard() {
  const user = await requireSession("/dashboard/pro");
  const [clubs, subscription] = await Promise.all([
    getClubsForUser(user.id),
    getProSubscription(user.id),
  ]);

  const owned = clubs.filter((entry) => entry.relationship === "owner").map((entry) => entry.club);
  const proClubIds = subscription?.proClubIds ?? [];

  const cooldownEnds = subscription?.lastTransferAt
    ? new Date(
        new Date(subscription.lastTransferAt).getTime() +
          PLATFORM.pro.transferCooldownDays * 24 * 60 * 60 * 1000,
      )
    : null;
  const daysLeft = cooldownEnds
    ? Math.max(0, Math.ceil((cooldownEnds.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <>
      <PageHeader
        title="Divotz Pro"
        description="Extra customization for clubs that want it. Everything else in Divotz stays free."
        actions={subscription ? <StatusPill tone="success">Active</StatusPill> : null}
      />

      {subscription ? (
        <Card className="mb-8">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">
                {subscription.plan === "seasonal"
                  ? `${formatMoney(PLATFORM.pro.seasonalCents)} per season`
                  : `${formatMoney(PLATFORM.pro.monthlyCents)} per month`}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Renews {formatDate(subscription.renewsAt)} · covers up to{" "}
                {PLATFORM.pro.maxProClubs} clubs
              </p>
            </div>
            <StatusPill tone="neutral" icon={false}>
              {proClubIds.length} of {PLATFORM.pro.maxProClubs} in use
            </StatusPill>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <p className="text-sm font-medium text-ink">Monthly</p>
                <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                  {formatMoney(PLATFORM.pro.monthlyCents)}
                  <span className="text-sm font-normal text-ink-muted"> / month</span>
                </p>
              </div>
              <div className="rounded-xl border border-[var(--club-primary)] p-4">
                <p className="text-sm font-medium text-ink">Season</p>
                <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                  {formatMoney(PLATFORM.pro.seasonalCents)}
                  <span className="text-sm font-normal text-ink-muted"> / year</span>
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">Renews each year.</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-muted leading-relaxed">
              Pro helps cover the cost of running Divotz. It adds customization and polish - it
              doesn&apos;t unlock tournaments, members, registration or scoring, which are free for
              everyone.
            </p>
          </CardBody>
        </Card>
      )}

      {owned.length > 0 && subscription ? (
        <section className="mb-8">
          <SectionLabel>Which clubs have Pro</SectionLabel>
          <p className="mt-1 mb-3 max-w-2xl text-sm text-ink-muted">
            Your subscription covers {PLATFORM.pro.maxProClubs} clubs at a time. Your other clubs
            carry on as free clubs - they keep everything except the customization.
          </p>
          <ProClubPicker
            clubs={owned.map((club) => ({ id: club.id, name: club.name, slug: club.slug }))}
            proClubIds={proClubIds}
            maxProClubs={PLATFORM.pro.maxProClubs}
            cooldownDaysLeft={daysLeft}
          />
        </section>
      ) : null}

      <section>
        <SectionLabel>What Pro includes</SectionLabel>
        <Card className="mt-3 divide-y divide-line">
          {PRO_FEATURES.map((feature) => (
            <CardBody key={feature}>
              <p className="text-sm font-medium text-ink">{PRO_FEATURE_LABELS[feature].title}</p>
              <p className="mt-0.5 text-[13px] text-ink-muted leading-relaxed">
                {PRO_FEATURE_LABELS[feature].description}
              </p>
            </CardBody>
          ))}
        </Card>
        <p className="mt-3 text-[13px] text-ink-muted">
          Club logos are free on every plan.
        </p>
      </section>
    </>
  );
}
