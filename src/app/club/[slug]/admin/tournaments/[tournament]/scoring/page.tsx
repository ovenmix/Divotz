import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { resolveClub } from "@/lib/club-request";
import { getTournamentBySlug } from "@/lib/domain/repository";

export const metadata = { title: "Scoring" };

export default async function ScoringPage({
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
      <PageHeader eyebrow={event.name} title="Scoring" description="Enter and check scores." />
      <EmptyState
        headline="No scores yet."
        body="Once the field is out on the course, scores land here as they come in."
        icon={ListChecks}
        action={<Button variant="outline">Enter scores</Button>}
      />
    </>
  );
}
