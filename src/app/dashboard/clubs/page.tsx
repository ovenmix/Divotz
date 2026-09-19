import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getClubsForUser } from "@/lib/domain/repository";
import { clubUrl } from "@/lib/club-request";
import { ClubMark } from "@/components/club/club-mark";
import { ClubTheme } from "@/components/club/club-theme";

export const metadata = { title: "Clubs" };

/**
 * Ownership-level club management.
 *
 * Note what's here and what isn't: this page is about your *relationship* to a
 * club, not about running one. Settings, members, events and branding all live
 * inside the club itself.
 */
export default async function DashboardClubs() {
  const user = await requireSession("/dashboard/clubs");
  const clubs = await getClubsForUser(user.id);

  return (
    <>
      <PageHeader
        title="Your clubs"
        description="Clubs you own or belong to. Day-to-day club management happens inside each club."
      />

      <div className="space-y-3">
        {clubs.map(({ club, relationship }) => (
          <ClubTheme key={club.id} club={club}>
            <Card>
              <CardBody className="flex flex-wrap items-center gap-4">
                <ClubMark club={club} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{club.name}</p>
                  <p className="truncate text-[13px] text-ink-muted">
                    {clubUrl(club.slug).replace("https://", "")}
                  </p>
                </div>
                {club.plan === "pro" ? <StatusPill tone="quiet">Pro</StatusPill> : null}
                <StatusPill tone="neutral" icon={false}>
                  {relationship === "owner" ? "Owner" : relationship === "staff" ? "Staff" : "Member"}
                </StatusPill>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/club/${club.slug}`}
                    className="text-[13px] text-ink-muted hover:text-ink transition-colors"
                  >
                    Open club
                  </Link>
                  {relationship === "owner" ? (
                    <Link
                      href={`/dashboard/clubs/${club.slug}`}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:underline underline-offset-2"
                    >
                      Ownership
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </ClubTheme>
        ))}
      </div>
    </>
  );
}
