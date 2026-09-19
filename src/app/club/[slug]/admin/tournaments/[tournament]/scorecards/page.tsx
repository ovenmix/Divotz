import { notFound } from "next/navigation";
import { ScrollText } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { resolveClub } from "@/lib/club-request";
import { getTournamentBySlug } from "@/lib/domain/repository";

export const metadata = { title: "Scorecards" };

export default async function ScorecardsPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Scorecards"
        description="Print scorecards for the field, or scan the paper ones back in."
        actions={<Button variant="outline" size="sm">Print scorecards</Button>}
      />
      <EmptyState
        headline="No scanned cards yet."
        body="Photograph a completed scorecard and Divotz reads the scores off it."
        icon={ScrollText}
      />
    </>
  );
}
