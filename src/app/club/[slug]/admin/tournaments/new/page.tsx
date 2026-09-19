import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { CreateTournamentForm } from "@/components/admin/create-tournament-form";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { PAYMENT_LABELS, REGISTRATION_LABELS } from "@/lib/domain/settings";
import { createTournamentAction } from "@/app/club/[slug]/admin/actions";

export const metadata = { title: "Create tournament" };

/**
 * Creating a tournament.
 *
 * Short on purpose. The club has already said how it normally runs events, so
 * this asks for the handful of things that actually differ per event and lets
 * the rest inherit. An organiser who wants something unusual changes it
 * afterwards in the event's own settings.
 */
export default async function NewTournament({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "events.create");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Create tournament"
        description={`A new event at ${club.name}.`}
        breadcrumbs={[
          { label: "Admin", href: href("/admin") },
          { label: "Tournaments", href: href("/admin/tournaments") },
          { label: "Create" },
        ]}
      />

      <div className="mb-6">
        <Callout tone="info" title="Starting from your club's defaults">
          Registration: {REGISTRATION_LABELS[club.defaults.registration]}.{" "}
          {club.features.onlinePayments
            ? `Payment: ${PAYMENT_LABELS[club.defaults.payment]}.`
            : "This club doesn't take payment online."}{" "}
          You can change any of it for this event once it exists.
        </Callout>
      </div>

      <Card>
        <CardBody>
          <CreateTournamentForm
            action={createTournamentAction}
            slug={slug}
            basePath={basePath}
            /* Fee only appears if the club actually takes money online. */
            collectsPayment={club.features.onlinePayments && club.defaults.payment !== "none"}
          />
        </CardBody>
      </Card>
    </>
  );
}
