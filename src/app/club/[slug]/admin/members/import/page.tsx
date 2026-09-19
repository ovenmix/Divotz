import { PageHeader } from "@/components/ui/page";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getMembers } from "@/lib/domain/repository";
import { AccessDenied } from "@/components/club/access-denied";
import { MemberImport } from "@/components/admin/member-import";

export const metadata = { title: "Import members" };

export default async function ImportMembers({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "people.manage");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const existing = (await getMembers(club.id)).map((m) => ({
    id: m.id,
    email: m.email,
    name: m.name,
  }));

  return (
    <>
      <PageHeader
        title="Import members"
        description="Bring your existing membership list into Divotz. We'll match people you already have rather than creating duplicates."
        breadcrumbs={[
          { label: "Admin", href: href("/admin") },
          { label: "Members", href: href("/admin/members") },
          { label: "Import" },
        ]}
      />
      <MemberImport existing={existing} membersHref={href("/admin/members")} />
    </>
  );
}
