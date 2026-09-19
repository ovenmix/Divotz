import Link from "next/link";
import { redirect } from "next/navigation";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { Button } from "@/components/ui/button";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getMemberForUser, getRegistrations, getTournaments } from "@/lib/domain/repository";
import { expiryState, formatDate, membershipSummary } from "@/lib/domain/membership";
import { signOutAction } from "@/app/actions";

export const metadata = { title: "My Golf" };

/** The golfer's own corner: their membership, and what they're signed up for. */
export default async function MyGolf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, user, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  if (!user) redirect(href(`/sign-in?next=${encodeURIComponent(href("/my-golf"))}`));

  const [member, tournaments] = await Promise.all([
    getMemberForUser(club.id, user.id),
    getTournaments(club.id),
  ]);

  const mine: { name: string; slug: string; date: string; status: string }[] = [];
  for (const tournament of tournaments) {
    const registrations = await getRegistrations(tournament.id);
    const entry = registrations.find(
      (r) => r.userId === user.id || r.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (entry && entry.status !== "cancelled") {
      mine.push({
        name: tournament.name,
        slug: tournament.slug,
        date: tournament.date,
        status: entry.status,
      });
    }
  }

  const state = member ? expiryState(member) : "none";

  return (
    <ClubShell>
      <PageHeader title="My Golf" description={`Your ${club.name} golf, all in one place.`} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <SectionLabel>Membership</SectionLabel>
            {member ? (
              <div className="mt-3">
                <div className="flex items-center gap-2.5">
                  <StatusPill
                    tone={state === "expired" ? "danger" : state === "expiringSoon" ? "warning" : "success"}
                  >
                    {membershipSummary(member).label}
                  </StatusPill>
                  {member.handicap != null ? (
                    <span className="text-[13px] text-ink-muted tabular-nums">
                      Handicap {member.handicap.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2.5 text-sm text-ink-muted">{membershipSummary(member).detail}</p>
                {state === "expiringSoon" ? (
                  <p className="mt-2 text-[13px] text-warning-800">
                    Worth renewing before the season gets going.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                You have a Divotz account, but no membership on file at {club.name}. Having an
                account and being a member aren&apos;t the same thing - the pro shop can add you.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionLabel>You&apos;re signed up for</SectionLabel>
            {mine.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                Nothing on your card yet. Have a look at what&apos;s coming up.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {mine.map((entry) => (
                  <li key={entry.slug} className="flex items-center justify-between gap-3">
                    <Link
                      href={href(`/tournaments/${entry.slug}`)}
                      className="text-sm font-medium text-ink hover:underline underline-offset-2"
                    >
                      {entry.name}
                    </Link>
                    <span className="text-[13px] text-ink-muted">{formatDate(entry.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <form action={signOutAction} className="mt-6">
        <input type="hidden" name="next" value={href("/")} />
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </ClubShell>
  );
}
