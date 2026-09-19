import { notFound } from "next/navigation";
import { UsersRound } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { ButtonLink } from "@/components/ui/button";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getMembers } from "@/lib/domain/repository";
import { expiryState, membershipSummary } from "@/lib/domain/membership";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Members" };

/**
 * The public-ish members page.
 *
 * A roster is club information, not public information, so this is gated on
 * being signed in - and the gate sends people to the club's own sign-in, which
 * returns them right back here.
 */
export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  if (!club.navigation.includes("members")) notFound();

  const href = (path: string) => joinClubPath(basePath, path);

  if (!access.signedIn) {
    return (
      <ClubShell>
        <PageHeader title="Members" />
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-base font-semibold text-ink">Members only, this bit.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">
              Sign in to see the {club.name} membership.
            </p>
            <ButtonLink
              className="mt-5"
              href={href(`/sign-in?next=${encodeURIComponent(href("/members"))}`)}
            >
              Sign in
            </ButtonLink>
          </CardBody>
        </Card>
      </ClubShell>
    );
  }

  const members = (await getMembers(club.id)).filter((m) => m.status !== "suspended");

  return (
    <ClubShell>
      <PageHeader title="Members" description={`${members.length} members at ${club.name}.`} />
      {members.length === 0 ? (
        <EmptyState {...EMPTY_STATES.members} icon={UsersRound} />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {members.map((member) => {
              const summary = membershipSummary(member);
              const state = expiryState(member);
              return (
                <li key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--club-primary-soft)] text-[12px] font-semibold text-[var(--club-primary-readable)]">
                    {member.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{member.name}</span>
                    {member.handicap != null ? (
                      <span className="block text-[13px] text-ink-muted tabular-nums">
                        Handicap {member.handicap.toFixed(1)}
                      </span>
                    ) : null}
                  </span>
                  <StatusPill
                    tone={state === "expired" ? "danger" : state === "expiringSoon" ? "warning" : "success"}
                  >
                    {summary.label}
                  </StatusPill>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </ClubShell>
  );
}
