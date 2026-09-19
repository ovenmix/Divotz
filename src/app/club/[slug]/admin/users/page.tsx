import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { StatusPill, Tag } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getClubPeople } from "@/lib/domain/repository";
import { expiryState, membershipSummary } from "@/lib/domain/membership";
import { ROLE_LABELS } from "@/lib/domain/permissions";
import { AccessDenied } from "@/components/club/access-denied";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Users" };

/**
 * Users: everyone the club has any relationship with.
 *
 * Deliberately not the same list as Members. Somebody here might be a member
 * with no account, an account holder who played one open event, staff, or all
 * three - and the row has to say which, because the club's next action depends
 * on it.
 */
export default async function UsersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "people.view");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const people = await getClubPeople(club.id);

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone connected to the club - members, staff, and anyone who's registered for an event."
      />

      {people.length === 0 ? (
        <EmptyState {...EMPTY_STATES.users} icon={Users} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <Th>Name</Th>
                  <Th>Account</Th>
                  <Th>Member</Th>
                  <Th>Role</Th>
                  <Th>Last activity</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {people.map((person) => {
                  const state = person.member ? expiryState(person.member) : "none";
                  const summary = person.member ? membershipSummary(person.member) : null;
                  return (
                    <tr key={person.email} className="hover:bg-cream-500/40">
                      <td className="px-5 py-3.5">
                        <span className="block font-medium text-ink">{person.name}</span>
                        <span className="block text-[13px] text-ink-muted">{person.email}</span>
                        {person.phone ? (
                          <span className="block text-[13px] text-ink-subtle">{person.phone}</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5">
                        {/*
                         * Having an account and being a member are separate
                         * facts, and this table refuses to conflate them.
                         */}
                        <StatusPill tone={person.hasAccount ? "success" : "quiet"}>
                          {person.hasAccount ? "Has account" : "No account"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-3.5">
                        {person.member ? (
                          <>
                            <StatusPill
                              tone={
                                state === "expired"
                                  ? "danger"
                                  : state === "expiringSoon"
                                    ? "warning"
                                    : person.member.status === "pending"
                                      ? "info"
                                      : "success"
                              }
                            >
                              {summary!.label}
                            </StatusPill>
                            <span className="mt-1 block text-[12px] text-ink-subtle">
                              {summary!.detail}
                            </span>
                          </>
                        ) : (
                          <span className="text-[13px] text-ink-subtle">Not a member</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {person.staff ? (
                          <Tag>{ROLE_LABELS[person.staff.role]}</Tag>
                        ) : (
                          <span className="text-[13px] text-ink-subtle">Golfer</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-ink-muted tabular-nums">
                        {person.lastActiveAt ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
      {children}
    </th>
  );
}
