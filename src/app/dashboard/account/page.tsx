import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Field, Input } from "@/components/ui/form";
import { requireSession } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import { formatDate } from "@/lib/domain/membership";

export const metadata = { title: "Account" };

export default async function Account() {
  const user = await requireSession("/dashboard/account");

  return (
    <>
      <PageHeader title="Your account" description="Your Divotz account, across every club." />

      <Card className="mb-8">
        <CardBody className="space-y-4">
          <Field label="Name" htmlFor="name">
            <Input id="name" defaultValue={user.name} className="max-w-sm" />
          </Field>
          <Field label="Email" htmlFor="email" hint="Clubs match their membership lists on this.">
            <Input id="email" type="email" defaultValue={user.email} className="max-w-sm" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" type="tel" defaultValue={user.phone ?? ""} className="max-w-sm" />
          </Field>
          <Button variant="outline" size="sm">
            Save
          </Button>
        </CardBody>
      </Card>

      <section className="mb-8">
        <SectionLabel>Payment methods</SectionLabel>
        <Card className="mt-3">
          <CardBody>
            {user.savedPaymentMethod ? (
              <p className="text-sm text-ink">
                {user.savedPaymentMethod.brand} ending {user.savedPaymentMethod.last4}
                <span className="ml-2 text-[13px] text-ink-muted">
                  Used when you pay for an event through Divotz.
                </span>
              </p>
            ) : (
              <p className="text-sm text-ink-muted">
                No saved card. You can add one at checkout - it just saves typing next time.
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <SectionLabel>Session</SectionLabel>
        <Card className="mt-3">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-ink-muted">
              Account created {formatDate(user.createdAt)}
            </p>
            <form action={signOutAction}>
              <input type="hidden" name="next" value="/" />
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
