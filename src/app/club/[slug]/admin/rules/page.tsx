import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { Field, Textarea } from "@/components/ui/form";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { updateRulesAction } from "@/app/club/[slug]/admin/actions";

export const metadata = { title: "Rules" };

export default async function RulesAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { club, basePath, denied } = await requireClubPermission(slug, "club.manage");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Club rules"
        description="Pace of play, cart rules, dress code - whatever your members should know."
      />
      {query.saved ? (
        <div className="mb-6">
          <Callout tone="success" title="Saved">
            Your rules are live on the club site.
          </Callout>
        </div>
      ) : null}
      <Card>
        <CardBody>
          <form action={updateRulesAction} className="space-y-4">
            <input type="hidden" name="clubSlug" value={slug} />
            <input type="hidden" name="basePath" value={basePath} />
            <Field
              label="Rules"
              htmlFor="rules"
              hint="Shown on your club's Rules page. Leave blank to hide the page entirely."
            >
              <Textarea id="rules" name="rules" rows={10} defaultValue={club.rules ?? ""} />
            </Field>
            <Button type="submit">Save rules</Button>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
