import { BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink, Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getMembers } from "@/lib/domain/repository";
import { can } from "@/lib/domain/permissions";
import { expiryState, membershipSummary } from "@/lib/domain/membership";
import { AccessDenied } from "@/components/club/access-denied";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Members" };

export default async function AdminMembers({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, access, basePath, denied } = await requireClubPermission(slug, "people.view");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const members = await getMembers(club.id);
  const counts = {
    active: members.filter((m) => expiryState(m) === "active" && m.status === "active").length,
    soon: members.filter((m) => expiryState(m) === "expiringSoon").length,
    expired: members.filter((m) => expiryState(m) === "expired").length,
  };

  return (
    <>
      <PageHeader
        title="Members"
        description="Your club's membership. Members don't need a Divotz account to be on this list."
        actions={
          can(access, "people.manage") ? (
            <>
              <ButtonLink href={href("/admin/members/import")} variant="outline">
                Import CSV
              </ButtonLink>
              <Button>Add member</Button>
            </>
          ) : null
        }
      />

      {members.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <StatusPill tone="success">{counts.active} active</StatusPill>
          {counts.soon > 0 ? <StatusPill tone="warning">{counts.soon} expiring soon</StatusPill> : null}
          {counts.expired > 0 ? <StatusPill tone="danger">{counts.expired} expired</StatusPill> : null}
        </div>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          {...EMPTY_STATES.members}
          icon={BadgeCheck}
          action={
            can(access, "people.manage") ? (
              <ButtonLink href={href("/admin/members/import")}>Import your list</ButtonLink>
            ) : null
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {members.map((member) => {
              const state = expiryState(member);
              const summary = membershipSummary(member);
              return (
                <li key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{member.name}</span>
                    <span className="block text-[13px] text-ink-muted">{member.email}</span>
                  </span>
                  {member.handicap != null ? (
                    <span className="text-[13px] text-ink-muted tabular-nums">
                      HCP {member.handicap.toFixed(1)}
                    </span>
                  ) : null}
                  {/* Status is a word first; the colour only reinforces it. */}
                  <span className="text-right">
                    <StatusPill
                      tone={
                        state === "expired"
                          ? "danger"
                          : state === "expiringSoon"
                            ? "warning"
                            : member.status === "pending"
                              ? "info"
                              : member.status === "suspended"
                                ? "danger"
                                : "success"
                      }
                    >
                      {summary.label}
                    </StatusPill>
                    <span className="mt-1 block text-[12px] text-ink-subtle">{summary.detail}</span>
                  </span>
                  {member.userId ? null : (
                    <StatusPill tone="quiet">No account yet</StatusPill>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
