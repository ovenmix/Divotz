import { notFound } from "next/navigation";
import { SidebarLayer, SidebarLayerMobile } from "@/components/nav/sidebar";
import { resolveClub } from "@/lib/club-request";
import { getTournamentBySlug } from "@/lib/domain/repository";
import { buildTournamentNav } from "@/lib/navigation";
import { resolveEventSettings } from "@/lib/domain/settings";

/**
 * The third layer: one tournament.
 *
 * Club -> Admin -> this event. The layers above stay where they are, so the
 * hierarchy is visible without every level being on screen at once. Which
 * pages exist here depends on what the club and the event actually use - an
 * event with no payment has no Payments tab.
 */
export default async function TournamentAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, basePath } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const settings = resolveEventSettings(club, event);
  const sections = buildTournamentNav(event.slug, {
    payments: settings.payment.value !== "none",
    leaderboard: settings.leaderboard.value !== "off",
    scorecards: club.features.scorecardScanning,
    teeSheet: club.features.teeSheetIntegration,
  });

  return (
    <div className="-mx-5 -my-7 flex min-h-full flex-1 lg:-mx-9 lg:-my-9">
      <SidebarLayer
        title={event.name}
        backHref="/admin/tournaments"
        backLabel="All tournaments"
        sections={sections}
        basePath={basePath}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <SidebarLayerMobile sections={sections} basePath={basePath} label={event.name} />
        <div className="px-5 py-7 lg:px-9 lg:py-9">{children}</div>
      </div>
    </div>
  );
}
