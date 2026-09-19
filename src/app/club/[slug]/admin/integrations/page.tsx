import Link from "next/link";
import { ArrowRight, Blocks } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";

export const metadata = { title: "Integrations" };

/**
 * Integrations live inside the club, not on the platform dashboard.
 *
 * A tee sheet connection is a fact about this club's pro shop, so it belongs
 * where the rest of this club's operating model is set.
 */
export default async function Integrations({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "club.integrations");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const rows = [
    {
      title: "Payments",
      description: club.features.onlinePayments
        ? "Collect entry fees online."
        : "Not in use. Turn on online payments to set this up.",
      href: href("/admin/integrations/payments"),
      status: club.features.onlinePayments ? "On" : "Off",
      tone: club.features.onlinePayments ? ("success" as const) : ("quiet" as const),
    },
    ...(club.features.teeSheetIntegration
      ? [
          {
            title: "Tee sheets",
            description: "Push groups and tee times to your tee sheet provider.",
            href: href("/admin/integrations/tee-sheets"),
            status: "Not connected",
            tone: "quiet" as const,
          },
        ]
      : []),
    {
      title: "Handicaps",
      description: club.features.handicapIntegration
        ? "Keep member handicaps in step with your provider."
        : "Not in use. Handicaps are entered by hand.",
      href: href("/admin/settings"),
      status: club.features.handicapIntegration ? "On" : "Off",
      tone: club.features.handicapIntegration ? ("success" as const) : ("quiet" as const),
    },
  ];

  return (
    <>
      <PageHeader
        title="Integrations"
        description={`What ${club.name} connects Divotz to.`}
      />
      <Card>
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.title}>
              <Link
                href={row.href}
                className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cream-500/60 transition-colors"
              >
                <Blocks className="size-5 shrink-0 text-ink-subtle" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{row.title}</span>
                  <span className="block text-[13px] text-ink-muted">{row.description}</span>
                </span>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
                <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
