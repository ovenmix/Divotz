import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout, StatusPill } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";

export const metadata = { title: "Tee sheets" };

/** The sync states a real integration has to handle, named up front. */
const SYNC_STATES = [
  ["Not connected", "No provider linked to this club."],
  ["Connected", "Linked, nothing pushed yet."],
  ["Ready to sync", "Groups and times are set and can be pushed."],
  ["Syncing", "The push is in flight."],
  ["Synced", "Divotz and the tee sheet agree."],
  ["Changes pending", "Something changed on one side since the last push."],
  ["Sync conflict", "Both sides changed. Someone has to decide."],
];

export default async function TeeSheets({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club, basePath, denied } = await requireClubPermission(slug, "club.integrations");
  if (!club.features.teeSheetIntegration) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Tee sheets"
        description="Send groups and tee times from Divotz to the system your pro shop already runs."
      />

      {/*
       * No provider is connected and none is mocked up. A tee sheet is a live
       * operational system; a button that pretends to push to it is worse than
       * no button, because somebody will believe it.
       */}
      <div className="mb-7">
        <Callout tone="info" title="No provider connected yet">
          Support for Lightspeed Golf, Golf One and other tee sheet providers is still being
          designed. Until one is connected, build your groups in Divotz and export or print them.
        </Callout>
      </div>

      <section className="mb-8">
        <SectionLabel>The workflow this will support</SectionLabel>
        <Card className="mt-3">
          <CardBody>
            <ol className="space-y-2 text-sm text-ink-muted">
              {[
                "Create the tournament in Divotz",
                "Register players",
                "Build groups",
                "Assign tee times and starting holes",
                "Push the sheet to your provider",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--club-primary-soft)] text-[11px] font-semibold text-[var(--club-primary-readable)] tabular-nums">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </section>

      <section>
        <SectionLabel>Sync states</SectionLabel>
        <p className="mt-1 mb-3 max-w-2xl text-sm text-ink-muted">
          A one-way push isn&apos;t enough on its own - a tee sheet changes at the pro shop too.
          These are the states the integration has to account for.
        </p>
        <Card className="divide-y divide-line">
          {SYNC_STATES.map(([state, description]) => (
            <CardBody key={state} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{state}</p>
                <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
              </div>
              {state === "Not connected" ? <StatusPill tone="quiet">Current</StatusPill> : null}
            </CardBody>
          ))}
        </Card>
        <div className="mt-5">
          <Button variant="outline" disabled>
            Connect a provider
          </Button>
          <p className="mt-2 text-[13px] text-ink-subtle">Available once a provider is supported.</p>
        </div>
      </section>
    </>
  );
}
