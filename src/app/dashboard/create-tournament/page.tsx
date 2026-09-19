import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { getClubsForUser } from "@/lib/domain/repository";
import { CreateStandaloneForm } from "@/components/dashboard/create-standalone-form";
import { createStandaloneTournamentAction } from "@/app/dashboard/actions";

export const metadata = { title: "Create a tournament" };

/**
 * A tournament with no club behind it.
 *
 * If the person already runs a club, we point them there first - an event
 * inside a club inherits how that club works, which is almost always what they
 * want. This page is for the genuinely standalone case.
 */
export default async function CreateTournament() {
  const user = await requireSession("/dashboard/create-tournament");
  const clubs = (await getClubsForUser(user.id)).filter((entry) => entry.relationship !== "member");

  return (
    <>
      <PageHeader
        title="Create a tournament"
        description="A one-off event that isn't run by a club."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Create a tournament" }]}
      />

      {clubs.length > 0 ? (
        <div className="mb-6">
          <Callout tone="info" title="Running this for one of your clubs?">
            Create it inside the club instead and it picks up how that club normally runs events -
            registration, payment, the fields you collect.
            <span className="mt-2 block">
              {clubs.map(({ club }) => (
                <Link
                  key={club.id}
                  href={`/club/${club.slug}/admin/tournaments/new`}
                  className="mr-3 inline-block font-medium underline underline-offset-2"
                >
                  {club.name}
                </Link>
              ))}
            </span>
          </Callout>
        </div>
      ) : null}

      <Card>
        <CardBody>
          <CreateStandaloneForm action={createStandaloneTournamentAction} />
        </CardBody>
      </Card>
    </>
  );
}
