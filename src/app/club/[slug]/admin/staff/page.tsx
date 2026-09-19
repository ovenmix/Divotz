import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page";
import { StatusPill, Tag } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getStaff, getUser } from "@/lib/domain/repository";
import { PERMISSION_LABELS, ROLE_LABELS } from "@/lib/domain/permissions";
import { AccessDenied } from "@/components/club/access-denied";
import { formatDate } from "@/lib/domain/membership";

export const metadata = { title: "Staff" };

/**
 * Staff and what each of them can reach.
 *
 * Permissions are shown as the words they mean rather than as a role name
 * alone, because "organizer" tells an owner nothing about whether that person
 * can see the club's money. Financial permissions are called out separately.
 */
export default async function StaffPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "club.manage");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const staff = await getStaff(club.id);
  const owner = await getUser(club.ownerId);
  const rows = await Promise.all(
    staff.map(async (member) => ({ staff: member, user: await getUser(member.userId) })),
  );

  return (
    <>
      <PageHeader
        title="Staff"
        description="The people who help run your events, and what each of them can reach."
        actions={<Button>Add staff</Button>}
      />

      <div className="space-y-3">
        {owner ? (
          <Card>
            <CardBody className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{owner.name}</p>
                <p className="text-[13px] text-ink-muted">{owner.email}</p>
                <p className="mt-2 text-[13px] text-ink-subtle">
                  The owner can do everything, including things that can&apos;t be undone.
                  Ownership is managed from your Divotz account, not here.
                </p>
              </div>
              <Tag>Owner</Tag>
            </CardBody>
          </Card>
        ) : null}

        {rows.map(({ staff: member, user }) => (
          <Card key={member.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{user?.name ?? "Unknown"}</p>
                  <p className="text-[13px] text-ink-muted">{user?.email}</p>
                  <p className="mt-0.5 text-[12px] text-ink-subtle">
                    Added {formatDate(member.addedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag>{ROLE_LABELS[member.role]}</Tag>
                  <Button size="sm" variant="outline">
                    Edit access
                  </Button>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {member.permissions.map((permission) => (
                  <li key={permission}>
                    <StatusPill tone={permission.startsWith("payments") ? "info" : "quiet"} icon={false}>
                      {PERMISSION_LABELS[permission]}
                    </StatusPill>
                  </li>
                ))}
              </ul>
              {!member.permissions.some((p) => p.startsWith("payments")) ? (
                <p className="mt-3 text-[13px] text-ink-subtle">
                  No access to payments or financial information.
                </p>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
