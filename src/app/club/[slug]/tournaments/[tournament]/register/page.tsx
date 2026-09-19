import { notFound, redirect } from "next/navigation";
import { ClubShell } from "@/components/club/club-shell";
import { Breadcrumbs } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { RegistrationForm } from "@/components/club/registration-form";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { countRegistrations, getTournamentBySlug } from "@/lib/domain/repository";
import { registrationAvailability, resolveEventSettings } from "@/lib/domain/settings";
import { computeFees } from "@/lib/domain/config";

export const metadata = { title: "Register" };

/**
 * Registration.
 *
 * The same page serves every mode the spec lays out, because the difference
 * between them is what we ask for and what we charge, not a different product:
 *
 *   public + no payment      information, then confirmation
 *   public + club payment    information, then "the club will take payment"
 *   public + Divotz payment  information, then a total, then pay
 *   members only             identify the member and check the membership
 *   invite only              the invite is the key
 *   staff managed            no public form at all
 */
export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; tournament: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const [{ slug, tournament: eventSlug }, query] = await Promise.all([params, searchParams]);
  const { club, user, access, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);

  const event = await getTournamentBySlug(club.id, eventSlug);
  if (!event) notFound();

  const settings = resolveEventSettings(club, event);
  const registered = await countRegistrations(event.id);
  const availability = registrationAvailability(
    settings.registration.value,
    {
      signedIn: access.signedIn,
      isActiveMember: access.isMember,
      isStaff: access.isStaff,
      invited: Boolean(query.invite),
    },
    { registered, capacity: event.capacity },
  );

  const eventHref = href(`/tournaments/${event.slug}`);

  // A members-only event needs to know who this is first. Send them to the
  // club's own sign-in, with a return trip straight back to this form.
  if (settings.registration.value === "membersOnly" && !access.signedIn) {
    redirect(href(`/sign-in?next=${encodeURIComponent(href(`/tournaments/${event.slug}/register`))}`));
  }

  if (!availability.canRegister) {
    return (
      <ClubShell>
        <Breadcrumbs
          items={[
            { label: club.name, href: href("/") },
            { label: "Tournaments", href: href("/tournaments") },
            { label: event.name, href: eventHref },
            { label: "Register" },
          ]}
        />
        <h1 className="text-2xl font-semibold text-ink">{event.name}</h1>
        <div className="mt-5 max-w-xl">
          <Callout tone="info" title={availability.label}>
            {copyFor(availability.state, club.name)}
          </Callout>
        </div>
      </ClubShell>
    );
  }

  const fees = event.entryFeeCents
    ? computeFees(event.entryFeeCents, settings.payment.value)
    : null;

  return (
    <ClubShell>
      <Breadcrumbs
        items={[
          { label: club.name, href: href("/") },
          { label: "Tournaments", href: href("/tournaments") },
          { label: event.name, href: eventHref },
          { label: "Register" },
        ]}
      />

      <h1 className="text-2xl font-semibold text-ink">Register for {event.name}</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        {availability.state === "waitlist"
          ? "The field is full, but we'll hold your place in line."
          : availability.state === "approvalRequired"
            ? "We'll pass your entry to the club to confirm."
            : "A few details and you're on the sheet."}
      </p>

      <div className="mt-7 max-w-2xl">
        <RegistrationForm
          clubName={club.name}
          eventName={event.name}
          fields={settings.registrationFields}
          paymentMode={settings.payment.value}
          fees={fees}
          waitlist={availability.state === "waitlist"}
          needsApproval={availability.state === "approvalRequired"}
          partnerRequests={settings.partnerRequests.value}
          viewer={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  phone: user.phone ?? "",
                  savedPaymentMethod: user.savedPaymentMethod ?? null,
                }
              : null
          }
          signInHref={href(
            `/sign-in?next=${encodeURIComponent(href(`/tournaments/${event.slug}/register`))}`,
          )}
          confirmationHref={eventHref}
        />
      </div>
    </ClubShell>
  );
}

function copyFor(state: string, clubName: string): string {
  switch (state) {
    case "membersOnly":
      return `This tournament is open to active ${clubName} members. We don't have an active membership on file for your account.`;
    case "staffOnly":
      return "Players for this tournament are added by club staff. Get in touch with the pro shop.";
    case "inviteOnly":
      return "Registration is by invitation. Check your email for your invite link.";
    case "full":
      return "Every spot is taken, and there's no waitlist on this one.";
    default:
      return "Registration isn't open for this tournament.";
  }
}
