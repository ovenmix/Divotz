import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getTournamentBySlug } from "@/lib/domain/repository";

export const metadata = { title: "Tee sheet" };

/**
 * Pushing groups to an external tee sheet.
 *
 * No provider is connected and none is faked. The intended flow is described
 * honestly, and the states a real sync will need are named, because two-way
 * synchronisation against a live tee sheet needs architecture work before any
 * of it is worth building - a half-done sync silently double-books people.
 */
export default async function TeeSheetPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, basePath } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const href = (path: string) => joinClubPath(basePath, path);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Tee sheet"
        description="Send your groups and tee times to the club's tee sheet system."
      />

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Tee sheet provider</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              No provider is connected for {club.name} yet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone="quiet">Not connected</StatusPill>
            <Link
              href={href("/admin/integrations/tee-sheets")}
              className="text-[13px] underline underline-offset-2 hover:text-ink"
            >
              Set up
            </Link>
          </div>
        </CardBody>
      </Card>

      <Callout tone="info" title="How the push will work">
        Build your groups in Divotz, assign tee times and starting holes, then push the whole sheet
        across in one go - players, groups, times, starting holes and the tournament name. Until a
        provider is connected here, groups stay in Divotz and can be printed or exported.
      </Callout>
    </>
  );
}
