import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { ProPreview } from "@/components/ui/setting";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { PLATFORM, PRO_FEATURES, PRO_FEATURE_LABELS, formatMoney } from "@/lib/domain/config";
import { ColorPreview, FontPreview, PhotoPreview } from "@/components/admin/pro-previews";

export const metadata = { title: "Pro" };

/**
 * The Pro page.
 *
 * This is the *one* place Pro is sold. Previews of what Pro does live here, so
 * that a free club's everyday screens can stay free of locks, badges and
 * upgrade prompts. Pro is extra polish for clubs that want it - the free
 * product is a real product, not a trial.
 */
export default async function ProPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "club.pro");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const isPro = club.plan === "pro";

  const previews: Record<string, React.ReactNode> = {
    colors: <ColorPreview club={club} />,
    typography: <FontPreview />,
    photography: <PhotoPreview />,
  };

  return (
    <>
      <PageHeader
        title={isPro ? "Club customization" : "Divotz Pro"}
        description={
          isPro
            ? `${club.name} is on Pro. Here's everything you can customize.`
            : "A few extras for clubs that want their site to look like theirs."
        }
        actions={isPro ? <StatusPill tone="success">Pro</StatusPill> : null}
      />

      {!isPro ? (
        <Card className="mb-8">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">
                {formatMoney(PLATFORM.pro.monthlyCents)} a month, or{" "}
                {formatMoney(PLATFORM.pro.seasonalCents)} for the season.
              </p>
              <p className="mt-1 max-w-xl text-[13px] text-ink-muted leading-relaxed">
                Pro covers up to {PLATFORM.pro.maxProClubs} clubs at a time and helps pay for
                running Divotz. Everything else - tournaments, members, registration, scoring -
                stays free.
              </p>
            </div>
            <ButtonLink href="/dashboard/pro">See Pro</ButtonLink>
          </CardBody>
        </Card>
      ) : null}

      <SectionLabel>What Pro customizes</SectionLabel>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {PRO_FEATURES.map((feature) => (
          <ProPreview
            key={feature}
            title={PRO_FEATURE_LABELS[feature].title}
            description={PRO_FEATURE_LABELS[feature].description}
            preview={previews[feature]}
            available={isPro}
          >
            {feature === "colors" || feature === "photography" ? (
              <Link
                href={href("/admin/branding")}
                className="text-sm font-medium text-[var(--club-primary-readable)] underline underline-offset-2"
              >
                Open branding
              </Link>
            ) : feature === "emailTemplates" ? (
              <Link
                href={href("/admin/communications")}
                className="text-sm font-medium text-[var(--club-primary-readable)] underline underline-offset-2"
              >
                Open communications
              </Link>
            ) : (
              <p className="text-sm text-ink-muted">
                {feature === "customDomain"
                  ? club.customDomain
                    ? `Running on ${club.customDomain}.`
                    : `Currently on ${club.slug}.${PLATFORM.rootDomain}. Get in touch to point your own domain here.`
                  : "Set your typeface from branding."}
              </p>
            )}
          </ProPreview>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-ink-muted">
        Your club&apos;s logo is free on every plan, and always will be.{" "}
        <Link href={href("/admin/branding")} className="underline underline-offset-2 hover:text-ink">
          Upload it here.
        </Link>
      </p>
    </>
  );
}
