import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { getTournamentBySlug } from "@/lib/domain/repository";
import { LEADERBOARD_LABELS, resolveEventSettings } from "@/lib/domain/settings";
import { EMPTY_STATES } from "@/lib/copy";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const settings = resolveEventSettings(club, event);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Leaderboard"
        actions={
          <StatusPill tone="info">{LEADERBOARD_LABELS[settings.leaderboard.value]}</StatusPill>
        }
      />
      <EmptyState {...EMPTY_STATES.results} icon={Trophy} />
    </>
  );
}
