import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { SettingGroup, SettingRow, InheritanceNote } from "@/components/ui/setting";
import { StatusPill } from "@/components/ui/status";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { getTournamentBySlug } from "@/lib/domain/repository";
import {
  LEADERBOARD_LABELS,
  PAYMENT_LABELS,
  REGISTRATION_DESCRIPTIONS,
  REGISTRATION_LABELS,
  resolveEventSettings,
} from "@/lib/domain/settings";
import { formatMoney } from "@/lib/domain/config";
import { FORMAT_LABELS } from "@/lib/domain/format";
import { EventOverrideControl } from "@/components/admin/override-control";

export const metadata = { title: "Settings" };

/**
 * Event settings.
 *
 * Grouped by concept, and only the groups that apply. The club has already
 * decided how it operates; this page is where an organiser deliberately
 * departs from that for one event - and every departure is labelled, so the
 * next person can tell at a glance why this event behaves differently.
 */
export default async function TournamentSettings({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, basePath } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const href = (path: string) => joinClubPath(basePath, path);
  const settings = resolveEventSettings(club, event);

  return (
    <>
      <PageHeader
        eyebrow={event.name}
        title="Event settings"
        description="This event starts from your club's defaults. Change anything that needs to be different just for this one."
      />

      <SettingGroup title="General">
        <SettingRow label="Name" control={<span className="text-sm text-ink">{event.name}</span>} />
        <SettingRow label="Date" control={<span className="text-sm text-ink">{event.date}</span>} />
        <SettingRow
          label="Format"
          control={<span className="text-sm text-ink">{FORMAT_LABELS[event.format]}</span>}
        />
        <SettingRow
          label="Field size"
          description="Once the field is full, registration offers a waitlist instead."
          control={
            <span className="text-sm text-ink tabular-nums">
              {event.capacity ?? "No limit"}
            </span>
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Registration"
        description="Who can put their name down, and how."
      >
        <SettingRow
          label="Who can register"
          description={REGISTRATION_DESCRIPTIONS[settings.registration.value]}
          inheritance={
            <InheritanceNote
              clubDefault={REGISTRATION_LABELS[settings.registration.clubDefault]}
              overridden={settings.registration.overridden}
              settingsHref={href("/admin/settings")}
            />
          }
          control={
            <EventOverrideControl
              current={REGISTRATION_LABELS[settings.registration.value]}
              overridden={settings.registration.overridden}
            />
          }
        />
        {settings.partnerRequests.value || club.features.partnerRequests ? (
          <SettingRow
            label="Partner requests"
            description="Let golfers name someone they'd like to be grouped with."
            inheritance={
              <InheritanceNote
                clubDefault={settings.partnerRequests.clubDefault ? "On" : "Off"}
                overridden={settings.partnerRequests.overridden}
                settingsHref={href("/admin/settings")}
              />
            }
            control={
              <StatusPill tone={settings.partnerRequests.value ? "success" : "quiet"}>
                {settings.partnerRequests.value ? "On" : "Off"}
              </StatusPill>
            }
          />
        ) : null}
      </SettingGroup>

      {/*
       * Payments only appear if the club takes payment online. A club that has
       * switched payments off at club level never sees a payment section here,
       * disabled or otherwise - the decision was already made, once.
       */}
      {club.features.onlinePayments ? (
        <SettingGroup title="Payments" description="How the entry fee gets collected.">
          <SettingRow
            label="Payment method"
            inheritance={
              <InheritanceNote
                clubDefault={PAYMENT_LABELS[settings.payment.clubDefault]}
                overridden={settings.payment.overridden}
                settingsHref={href("/admin/integrations/payments")}
              />
            }
            control={
              <EventOverrideControl
                current={PAYMENT_LABELS[settings.payment.value]}
                overridden={settings.payment.overridden}
              />
            }
          />
          <SettingRow
            label="Entry fee"
            control={
              <span className="text-sm text-ink tabular-nums">
                {event.entryFeeCents ? formatMoney(event.entryFeeCents) : "Free"}
              </span>
            }
          />
        </SettingGroup>
      ) : null}

      {club.features.liveLeaderboards ? (
        <SettingGroup title="Leaderboard" description="Who can see scores as they come in.">
          <SettingRow
            label="Visibility"
            inheritance={
              <InheritanceNote
                clubDefault={LEADERBOARD_LABELS[settings.leaderboard.clubDefault]}
                overridden={settings.leaderboard.overridden}
                settingsHref={href("/admin/settings")}
              />
            }
            control={
              <EventOverrideControl
                current={LEADERBOARD_LABELS[settings.leaderboard.value]}
                overridden={settings.leaderboard.overridden}
              />
            }
          />
        </SettingGroup>
      ) : null}

      <SettingGroup
        title="Registration fields"
        description="What each golfer is asked when they sign up."
      >
        {settings.registrationFields.length === 0 ? (
          <SettingRow
            label="No extra fields"
            description="Registration collects name and email only."
          />
        ) : (
          settings.registrationFields.map((field) => {
            const fromClub = club.defaults.registrationFields.some((f) => f.id === field.id);
            return (
              <SettingRow
                key={field.id}
                label={field.label}
                description={`${field.required ? "Required" : "Optional"} · ${
                  field.visibility === "private" ? "Only the club sees this" : "Visible to others"
                }`}
                inheritance={
                  fromClub ? (
                    <p className="mt-2 text-[13px] text-ink-subtle">
                      Collected on every {club.name} event.
                    </p>
                  ) : (
                    <p className="mt-2 text-[13px] text-ink-subtle">Added for this event.</p>
                  )
                }
                control={<StatusPill tone="quiet">{fromClub ? "Club" : "This event"}</StatusPill>}
              />
            );
          })
        )}
      </SettingGroup>
    </>
  );
}
