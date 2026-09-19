import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { requireSession } from "@/lib/auth";
import { CreateClubForm } from "@/components/dashboard/create-club-form";
import { createClubAction } from "@/app/dashboard/actions";
import { PLATFORM } from "@/lib/domain/config";

export const metadata = { title: "Create a club" };

/**
 * Creating a club is a platform-level act - it's the one thing that can't
 * happen inside a club, because there isn't one yet. From the moment it
 * exists, everything about it happens at its own address.
 */
export default async function CreateClub() {
  await requireSession("/dashboard/create-club");

  return (
    <>
      <PageHeader
        title="Create a club"
        description="Your club gets its own site, its own address and its own way of doing things."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Create a club" }]}
      />

      <Card>
        <CardBody>
          <CreateClubForm action={createClubAction} rootDomain={PLATFORM.rootDomain} />
        </CardBody>
      </Card>

      <div className="mt-6">
        <Callout tone="info" title="What happens next">
          You&apos;ll land inside your new club, where you can upload your logo, add members and
          create your first tournament. Free clubs get all of it - Pro only adds colours,
          typography, photography, email templates and a custom domain.
        </Callout>
      </div>
    </>
  );
}
