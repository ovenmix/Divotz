import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page";
import { Toggle } from "@/components/ui/form";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Email" };

export default async function EmailPreferences() {
  await requireSession("/dashboard/account/email");

  const preferences = [
    ["Registration confirmations", "When you sign up for an event.", true],
    ["Payment receipts", "When you pay through Divotz.", true],
    ["Tee time reminders", "The day before you play.", true],
    ["Results", "When a leaderboard is finalised.", false],
    ["Club announcements", "News from clubs you belong to.", true],
  ] as const;

  return (
    <>
      <PageHeader title="Email" description="What Divotz sends you." />
      <Card className="divide-y divide-line">
        {preferences.map(([title, description, on]) => (
          <CardBody key={title} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
            </div>
            <Toggle defaultChecked={on} label={title} />
          </CardBody>
        ))}
      </Card>
    </>
  );
}
