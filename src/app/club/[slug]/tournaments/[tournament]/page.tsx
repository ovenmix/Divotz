import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Flag, Users } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Callout, StatusPill } from "@/components/ui/status";
import { Breadcrumbs } from "@/components/ui/page";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import {
  registrationAvailability,
  resolveEventSettings,
  REGISTRATION_LABELS,
} from "@/lib/domain/settings";
import { computeFees, formatMoney } from "@/lib/domain/config";
import { formatDate } from "@/lib/domain/membership";
import { FORMAT_LABELS } from "@/lib/domain/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament } = await params;
  const { club } = await resolveClub(slug);
  const event = await getTournamentBySlug(club.id, tournament);
  return { title: event?.name ?? "Tournament" };
}

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string; tournament: string }>;
}) {
  const { slug, tournament: eventSlug } = await params;
  const { club, access, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const settings = resolveEventSettings(club, event);
  const registered = await countRegistrations(event.id);
  const availability = registrationAvailability(
    settings.registration.value,
    { signedIn: access.signedIn, isActiveMember: access.isMember, isStaff: access.isStaff },
    { registered, capacity: event.capacity },
  );

  const paymentMode = settings.payment.value;
  const fees =
    event.entryFeeCents && paymentMode === "divotzCheckout"
      ? computeFees(event.entryFeeCents, paymentMode)
      : null;

  const registerHref = href(`/tournaments/${event.slug}/register`);
  /*
   * A members-only event that the visitor isn't signed in for sends them to
   * the *club's* sign-in and straight back here - never out to a platform
   * dashboard they didn't ask for.
   */
  const signInHref = href(`/sign-in?next=${encodeURIComponent(registerHref)}`);

  return (
    <ClubShell>
      <Breadcrumbs
        items={[
          { label: club.name, href: href("/") },
          { label: "Tournaments", href: href("/tournaments") },
          { label: event.name },
        ]}
      />

      {event.heroImageUrl ? (
        <div className="relative mb-6 aspect-[21/8] overflow-hidden rounded-card border border-line">
          <Image src={event.heroImageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-ink">{event.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {formatDate(event.date)}
            </span>
            {event.teeTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {event.teeTime}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Flag className="size-4" aria-hidden />
              {FORMAT_LABELS[event.format]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              {registered} registered{event.capacity ? ` of ${event.capacity}` : ""}
            </span>
          </p>
        </div>
        <StatusPill tone={availability.state === "open" ? "success" : "info"}>
          {availability.label}
        </StatusPill>
      </div>

      {event.description ? (
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{event.description}</p>
      ) : null}

      <Card className="mt-7">
        <CardBody className="space-y-5">
          {/*
           * Fees are stated here, before anyone starts filling in a form -
           * never revealed at the confirmation step.
           */}
          {event.entryFeeCents ? (
            <div>
              <h2 className="text-sm font-semibold text-ink">Entry</h2>
              <dl className="mt-3 max-w-sm space-y-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Entry fee</dt>
                  <dd className="tabular-nums text-ink">{formatMoney(event.entryFeeCents)}</dd>
                </div>
                {fees ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-muted">Divotz service fee</dt>
                      <dd className="tabular-nums text-ink">{formatMoney(fees.feeCents)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-line pt-1.5 font-medium">
                      <dt className="text-ink">Total</dt>
                      <dd className="tabular-nums text-ink">{formatMoney(fees.totalCents)}</dd>
                    </div>
                  </>
                ) : null}
              </dl>
              {paymentMode === "clubDirect" ? (
                <p className="mt-3 text-[13px] text-ink-muted">
                  Payment is handled directly by {club.name}.
                </p>
              ) : null}
              {paymentMode === "none" ? (
                <p className="mt-3 text-[13px] text-ink-muted">
                  Register here, then settle up at the clubhouse.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {availability.canRegister ? (
              <ButtonLink href={registerHref} size="lg">
                {availability.state === "waitlist" ? "Join waitlist" : "Register"}
              </ButtonLink>
            ) : availability.state === "membersOnly" && !access.signedIn ? (
              <>
                <ButtonLink href={signInHref} size="lg">
                  Sign in to register
                </ButtonLink>
                <p className="text-[13px] text-ink-muted">
                  This one&apos;s for {club.name} members.
                </p>
              </>
            ) : null}
          </div>

          {availability.state === "membersOnly" && access.signedIn && !access.isMember ? (
            <Callout tone="info" title="Members only">
              This tournament is open to active {club.name} members. We don&apos;t have an active
              membership on file for your account - the pro shop can sort that out.
            </Callout>
          ) : null}

          {availability.state === "staffOnly" && !access.isStaff ? (
            <Callout tone="info" title="Staff registration">
              Players for this one are added by club staff. Get in touch with the pro shop and
              they&apos;ll put you down.
            </Callout>
          ) : null}

          {availability.state === "full" ? (
            <Callout tone="warning" title="Tournament is full">
              Every spot is taken. Contact the pro shop and they&apos;ll let you know if anything opens up.
            </Callout>
          ) : null}

          {availability.state === "inviteOnly" && !availability.canRegister ? (
            <Callout tone="info" title="Invite only">
              Registration for this tournament is by invitation. Check your email for your invite link.
            </Callout>
          ) : null}
        </CardBody>
      </Card>

      {/* Staff get a way across to the admin side without leaving the club. */}
      {access.isStaff ? (
        <p className="mt-5 text-[13px] text-ink-muted">
          <Link
            href={href(`/admin/tournaments/${event.slug}`)}
            className="underline underline-offset-2 hover:text-ink"
          >
            Manage this tournament
          </Link>{" "}
          · Registration is set to {REGISTRATION_LABELS[settings.registration.value].toLowerCase()}
          {settings.registration.overridden ? " for this event only" : ""}.
        </p>
      ) : null}
    </ClubShell>
  );
}
