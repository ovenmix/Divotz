import { notFound } from "next/navigation";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";

export const metadata = { title: "Communications" };

export default async function Communications({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "club.manage");
  // Email off at club level means this page doesn't exist for this club.
  if (!club.features.emailNotifications) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Communications"
        description="What Divotz sends on your club's behalf."
        actions={<Button>New announcement</Button>}
      />

      <section className="mb-8">
        <SectionLabel>Automatic emails</SectionLabel>
        <Card className="mt-3 divide-y divide-line">
          {[
            ["Registration confirmation", "Sent when someone registers for an event."],
            ["Payment receipt", "Sent when Divotz processes a payment."],
            ["Tee time reminder", "Sent the day before an event."],
            ["Results", "Sent when a leaderboard is finalised."],
          ].map(([title, description]) => (
            <CardBody key={title} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
              </div>
              <StatusPill tone="success">On</StatusPill>
            </CardBody>
          ))}
        </Card>
        {club.plan !== "pro" ? (
          <p className="mt-3 text-[13px] text-ink-muted">
            These go out in the standard Divotz layout with your club&apos;s logo.{" "}
            <Link href={href("/admin/pro")} className="underline underline-offset-2 hover:text-ink">
              Pro clubs can use their own templates.
            </Link>
          </p>
        ) : null}
      </section>

      <section>
        <SectionLabel>Announcements</SectionLabel>
        <div className="mt-3">
          <EmptyState
            headline="Nothing sent yet."
            body="Announcements go to your members and show up on your club home page."
            icon={Megaphone}
            action={<Button>New announcement</Button>}
          />
        </div>
      </section>
    </>
  );
}
