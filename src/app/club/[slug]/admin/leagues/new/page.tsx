import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { CreateLeagueForm } from "@/components/admin/create-league-form";
import { createLeagueAction } from "@/app/club/[slug]/admin/actions";

export const metadata = { title: "Create league" };

export default async function NewLeague({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "events.create");
  if (!club.features.leagues) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Create league"
        breadcrumbs={[
          { label: "Admin", href: href("/admin") },
          { label: "Leagues", href: href("/admin/leagues") },
          { label: "Create" },
        ]}
      />
      <Card>
        <CardBody>
          <CreateLeagueForm action={createLeagueAction} slug={slug} basePath={basePath} />
        </CardBody>
      </Card>
    </>
  );
}
