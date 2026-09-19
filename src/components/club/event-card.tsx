import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill, type Tone } from "@/components/ui/status";
import { formatMoney } from "@/lib/domain/config";
import type { RegistrationAvailability } from "@/lib/domain/settings";
import type { Tournament } from "@/lib/domain/types";
import { formatDate } from "@/lib/domain/membership";

const STATE_TONES: Record<RegistrationAvailability["state"], Tone> = {
  open: "success",
  closed: "neutral",
  membersOnly: "info",
  inviteOnly: "info",
  staffOnly: "neutral",
  approvalRequired: "warning",
  full: "warning",
  waitlist: "warning",
};

export function EventCard({
  tournament,
  href,
  availability,
  registered,
  feeLabel,
}: {
  tournament: Tournament;
  href: string;
  availability: RegistrationAvailability;
  registered: number;
  feeLabel?: string | null;
}) {
  return (
    <Card as="li" className="transition-shadow hover:shadow-pop">
      <Link href={href} className="block p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-ink">{tournament.name}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatDate(tournament.date)}
                {tournament.teeTime ? ` · ${tournament.teeTime}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {registered} registered
                {tournament.capacity ? ` of ${tournament.capacity}` : ""}
              </span>
              {feeLabel ? <span className="tabular-nums">{feeLabel}</span> : null}
            </p>
          </div>
          {/*
           * Specific language, never a generic "Unavailable" - "Members only"
           * and "Tournament is full" need different reactions from a golfer.
           */}
          <StatusPill tone={STATE_TONES[availability.state]}>{availability.label}</StatusPill>
        </div>
        {tournament.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-ink-muted leading-relaxed">
            {tournament.description}
          </p>
        ) : null}
      </Link>
    </Card>
  );
}

export function eventFeeLabel(tournament: Tournament, paymentEnabled: boolean): string | null {
  // No fee is shown at all when the club doesn't take money through Divotz -
  // rather than "$0.00" or a struck-out price.
  if (!paymentEnabled || !tournament.entryFeeCents) return null;
  return formatMoney(tournament.entryFeeCents);
}

export function CourseLine({ location }: { location?: string }) {
  if (!location) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted">
      <MapPin className="size-3.5" aria-hidden />
      {location}
    </p>
  );
}
