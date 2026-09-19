/**
 * Club default -> event inherit -> event override.
 *
 * The distinction that matters: an event storing `null` inherits and will
 * follow the club if the club changes its mind; an event storing a value
 * overrides and will not. These are easy to conflate and expensive to get
 * wrong - a members-only club accidentally running a public event.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registrationAvailability,
  resolveEventSettings,
} from "../src/lib/domain/settings.ts";
import type { Club, Tournament } from "../src/lib/domain/types.ts";

function club(overrides: Partial<Club> = {}): Club {
  return {
    id: "c_test",
    slug: "test",
    name: "Test Golf",
    ownerId: "u_1",
    plan: "free",
    customDomain: null,
    features: {
      onlinePayments: true,
      onlineRegistration: true,
      publicTournaments: true,
      memberRegistration: true,
      leagues: true,
      partnerRequests: true,
      scorecardScanning: true,
      emailNotifications: true,
      liveLeaderboards: true,
      handicapIntegration: false,
      teeSheetIntegration: false,
      ...(overrides.features ?? {}),
    },
    defaults: {
      registration: "membersOnly",
      payment: "divotzCheckout",
      leaderboard: "public",
      partnerRequests: true,
      registrationFields: [],
      ...(overrides.defaults ?? {}),
    },
    branding: {
      logoUrl: null,
      iconUrl: null,
      heroImageUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      displayFont: null,
    },
    navigation: ["home", "tournaments"],
    createdAt: "2026-01-01",
    ...overrides,
  } as Club;
}

const event = (overrides: Partial<Tournament["overrides"]> = {}) => ({
  overrides: {
    registration: null,
    payment: null,
    leaderboard: null,
    partnerRequests: null,
    ...overrides,
  },
  extraFields: [],
});

test("an event with no overrides inherits every club default", () => {
  const settings = resolveEventSettings(club(), event());
  assert.equal(settings.registration.value, "membersOnly");
  assert.equal(settings.registration.source, "inherited");
  assert.equal(settings.registration.overridden, false);
  assert.equal(settings.payment.value, "divotzCheckout");
});

test("an override is reported as an override, with the club default alongside", () => {
  const settings = resolveEventSettings(club(), event({ registration: "public" }));
  assert.equal(settings.registration.value, "public");
  assert.equal(settings.registration.source, "override");
  assert.equal(settings.registration.overridden, true);
  // The admin UI needs both values to explain why this event differs.
  assert.equal(settings.registration.clubDefault, "membersOnly");
});

test("storing the club's own value is an explicit choice, not an override", () => {
  const settings = resolveEventSettings(club(), event({ registration: "membersOnly" }));
  assert.equal(settings.registration.source, "override");
  assert.equal(settings.registration.overridden, false, "it matches the club, so nothing to flag");
});

test("a club feature that is off overrules any event-level value", () => {
  // The club said it doesn't take money online. An event cannot opt back in.
  const settings = resolveEventSettings(
    club({ features: { onlinePayments: false } as Club["features"] }),
    event({ payment: "divotzCheckout" }),
  );
  assert.equal(settings.payment.value, "none");
  assert.equal(settings.payment.source, "forcedByClub");
  assert.equal(settings.payment.overridden, false);
});

test("registration falls back to staff-managed when online registration is off", () => {
  const settings = resolveEventSettings(
    club({ features: { onlineRegistration: false } as Club["features"] }),
    event({ registration: "public" }),
  );
  assert.equal(settings.registration.value, "staffManaged");
  assert.equal(settings.registration.source, "forcedByClub");
});

test("a standalone tournament is its own default", () => {
  const settings = resolveEventSettings(null, event());
  assert.equal(settings.registration.value, "public");
  assert.equal(settings.payment.value, "none");
  assert.equal(settings.registration.source, "inherited");
});

test("registration fields are club defaults first, then the event's own", () => {
  const withFields = club({
    defaults: {
      registrationFields: [
        { id: "f_phone", label: "Phone", type: "phone", required: true, visibility: "private" },
      ],
    } as Club["defaults"],
  });
  const settings = resolveEventSettings(withFields, {
    overrides: event().overrides,
    extraFields: [
      { id: "f_shirt", label: "Shirt size", type: "text", required: false, visibility: "private" },
    ],
  });
  assert.deepEqual(settings.registrationFields.map((f) => f.id), ["f_phone", "f_shirt"]);
});

/* ------------------------------------------------- registration availability */

const anon = { signedIn: false, isActiveMember: false, isStaff: false };
const member = { signedIn: true, isActiveMember: true, isStaff: false };
const signedInNonMember = { signedIn: true, isActiveMember: false, isStaff: false };
const staff = { signedIn: true, isActiveMember: false, isStaff: true };

test("members-only checks membership, not merely having an account", () => {
  const counts = { registered: 0, capacity: 48 };
  assert.equal(registrationAvailability("membersOnly", member, counts).canRegister, true);
  // This is the distinction the spec insists on: an account is not a membership.
  assert.equal(registrationAvailability("membersOnly", signedInNonMember, counts).canRegister, false);
  assert.equal(registrationAvailability("membersOnly", anon, counts).canRegister, false);
});

test("a full field offers a waitlist when there is one, and says so when there isn't", () => {
  const full = { registered: 48, capacity: 48 };
  assert.equal(registrationAvailability("public", anon, full).state, "full");
  assert.equal(registrationAvailability("public", anon, full).label, "Tournament is full");
  const waitlisted = registrationAvailability("public", anon, { ...full, waitlistEnabled: true });
  assert.equal(waitlisted.state, "waitlist");
  assert.equal(waitlisted.canRegister, true);
});

test("states get specific language, never a generic 'Unavailable'", () => {
  const counts = { registered: 0, capacity: null };
  const labels = (["off", "public", "membersOnly", "inviteOnly", "staffManaged", "publicWithApproval"] as const)
    .map((mode) => registrationAvailability(mode, anon, counts).label);
  for (const label of labels) {
    assert.ok(label.length > 0);
    assert.ok(!/unavailable/i.test(label), `"${label}" is too vague`);
  }
});

test("staff can always act on a staff-managed event; golfers cannot", () => {
  const counts = { registered: 0, capacity: null };
  assert.equal(registrationAvailability("staffManaged", staff, counts).canRegister, true);
  assert.equal(registrationAvailability("staffManaged", member, counts).canRegister, false);
});

test("invite-only opens only for someone holding an invitation", () => {
  const counts = { registered: 0, capacity: null };
  assert.equal(registrationAvailability("inviteOnly", anon, counts).canRegister, false);
  assert.equal(
    registrationAvailability("inviteOnly", { ...anon, invited: true }, counts).canRegister,
    true,
  );
});
