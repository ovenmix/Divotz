import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getClubBySlug, getProSubscription, getStaff, getUser } from "@/lib/domain/repository";
import { clubUrl } from "@/lib/club-request";
import { TransferOwnership } from "@/components/dashboard/transfer-ownership";
import { DeleteClub } from "@/components/dashboard/delete-club";
import { formatDate } from "@/lib/domain/membership";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  return { title: club ? `${club.name} ownership` : "Club ownership" };
}

/**
 * Ownership operations.
 *
 * Deliberately not beside the club's ordinary settings. Deleting a club and
 * handing it to somebody else are the two actions here that cannot be undone
 * by the person they happen to, so they live away from the switches an admin
 * flips on a Tuesday.
 */
export default async function ClubOwnership({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireSession(`/dashboard/clubs/${slug}`);
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  // Ownership operations are the owner's alone. Not delegable to staff.
  if (club.ownerId !== user.id) notFound();

  const [staff, subscription] = await Promise.all([
    getStaff(club.id),
    getProSubscription(user.id),
  ]);

  const candidates = await Promise.all(
    staff.map(async (member) => {
      const staffUser = await getUser(member.userId);
      return staffUser ? { id: staffUser.id, name: staffUser.name, email: staffUser.email } : null;
    }),
  );

  const eligible = candidates.filter(Boolean) as { id: string; name: string; email: string }[];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Clubs", href: "/dashboard/clubs" },
          { label: club.name },
        ]}
        title={`${club.name} ownership`}
        description="The operations that change who controls this club, or end it entirely."
      />

      <Card className="mb-8">
        <CardBody className="space-y-2.5 text-sm">
          <Row label="Club" value={club.name} />
          <Row label="Address" value={clubUrl(club.slug).replace("https://", "")} />
          <Row label="Owner" value={`${user.name} (you)`} />
          <Row label="Created" value={formatDate(club.createdAt)} />
          <Row
            label="Plan"
            value={club.plan === "pro" ? "Pro" : "Free"}
            badge={club.plan === "pro" ? <StatusPill tone="quiet">Pro</StatusPill> : undefined}
          />
        </CardBody>
      </Card>

      <p className="mb-8 text-[13px] text-ink-muted">
        Looking for settings, members or events?{" "}
        <Link
          href={`/club/${club.slug}/admin`}
          className="underline underline-offset-2 hover:text-ink"
        >
          Those live inside the club.
        </Link>
      </p>

      <section className="mb-8">
        <SectionLabel>Transfer ownership</SectionLabel>
        <div className="mt-3">
          <TransferOwnership
            clubName={club.name}
            currentOwner={user.name}
            candidates={eligible}
            isPro={club.plan === "pro"}
            proClubCount={subscription?.proClubIds.length ?? 0}
          />
        </div>
      </section>

      <section>
        <SectionLabel>Danger zone</SectionLabel>
        <div className="mt-3 space-y-4">
          <Callout tone="danger" title="Deleting a club can't be undone">
            Everything goes: events, registrations, the membership list, payment records and the
            club&apos;s address. Members lose access immediately.
          </Callout>
          <DeleteClub clubName={club.name} clubSlug={club.slug} />
        </div>
      </section>
    </>
  );
}

function Row({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="flex items-center gap-2 text-ink">
        {value}
        {badge}
      </span>
    </div>
  );
}
