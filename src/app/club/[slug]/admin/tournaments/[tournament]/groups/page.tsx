import { notFound } from "next/navigation";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { resolveClub } from "@/lib/club-request";
import { countRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Groups" };

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const registered = await countRegistrations(event.id);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Groups"
        description={`${registered} players to sort into groups.`}
        actions={<Button size="sm">Build groups</Button>}
      />
      <EmptyState
        {...EMPTY_STATES.groups}
        icon={UsersRound}
        action={<Button>Build groups</Button>}
      />
    </>
  );
}
