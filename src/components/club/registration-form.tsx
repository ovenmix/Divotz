"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";
import { Callout } from "@/components/ui/status";
import { formatMoney, formatRate, type FeeBreakdown } from "@/lib/domain/config";
import type { PaymentMode, RegistrationField } from "@/lib/domain/types";

/**
 * The registration form.
 *
 * Three things this deliberately does not do:
 *
 *   - It doesn't require an account. A public event takes a guest's details
 *     and lets them create an account afterwards if they want one.
 *   - It doesn't hide the service fee until the end. The total is on screen
 *     before the pay button exists.
 *   - It doesn't mention payment at all when the club doesn't take payment.
 */
export function RegistrationForm({
  clubName,
  eventName,
  fields,
  paymentMode,
  fees,
  waitlist,
  needsApproval,
  partnerRequests,
  viewer,
  signInHref,
  confirmationHref,
}: {
  clubName: string;
  eventName: string;
  fields: RegistrationField[];
  paymentMode: PaymentMode;
  fees: FeeBreakdown | null;
  waitlist: boolean;
  needsApproval: boolean;
  partnerRequests: boolean;
  viewer: {
    name: string;
    email: string;
    phone: string;
    savedPaymentMethod: { brand: string; last4: string } | null;
  } | null;
  signInHref: string;
  confirmationHref: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const charging = paymentMode === "divotzCheckout" && Boolean(fees && fees.totalCents > 0);

  if (submitted) {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <CheckCircle2 className="mx-auto size-10 text-success-500" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-ink">
            {waitlist ? "You're on the waitlist." : needsApproval ? "Entry received." : "Nice shot - you're in."}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted leading-relaxed">
            {waitlist
              ? `We'll email you the moment a spot opens up for ${eventName}.`
              : needsApproval
                ? `${clubName} will confirm your entry and we'll email you either way.`
                : paymentMode === "clubDirect"
                  ? `Registration confirmed. Payment is handled directly by ${clubName}.`
                  : paymentMode === "none"
                    ? "Registration confirmed. Please settle up at the clubhouse."
                    : "Registration confirmed and payment received. Your receipt is on its way by email."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href={confirmationHref} variant="outline">
              Back to {eventName}
            </ButtonLink>
            {!viewer ? (
              <ButtonLink href={signInHref}>Create a Divotz account</ButtonLink>
            ) : null}
          </div>
          {!viewer ? (
            <p className="mt-4 text-[13px] text-ink-subtle">
              An account is optional - it just saves you typing this out next time.
            </p>
          ) : null}
        </CardBody>
      </Card>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      {!viewer ? (
        <Callout tone="info">
          Have a Divotz account?{" "}
          <Link href={signInHref} className="underline underline-offset-2 font-medium">
            Sign in
          </Link>{" "}
          to fill this in automatically{charging ? " and use a saved payment method" : ""}. Not
          required - you can register as a guest.
        </Callout>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-ink">Your details</h2>
          <Field label="Name" required htmlFor="reg-name">
            <Input id="reg-name" name="name" defaultValue={viewer?.name} required autoComplete="name" />
          </Field>
          <Field label="Email" required htmlFor="reg-email">
            <Input
              id="reg-email"
              name="email"
              type="email"
              defaultValue={viewer?.email}
              required
              autoComplete="email"
            />
          </Field>

          {/* Club defaults first, then anything this event added on top. */}
          {fields.map((field) => (
            <Field
              key={field.id}
              label={field.label}
              required={field.required}
              htmlFor={`reg-${field.id}`}
              hint={field.visibility === "private" ? "Only the club sees this." : undefined}
            >
              {field.type === "select" ? (
                <Select id={`reg-${field.id}`} name={field.id} required={field.required}>
                  <option value="">Choose one</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" name={field.id} className="size-4 accent-[var(--club-primary)]" />
                  Yes
                </label>
              ) : (
                <Input
                  id={`reg-${field.id}`}
                  name={field.id}
                  type={field.type === "phone" ? "tel" : field.type === "email" ? "email" : "text"}
                  defaultValue={field.type === "phone" ? viewer?.phone : undefined}
                  required={field.required}
                />
              )}
            </Field>
          ))}

          {partnerRequests ? (
            <Field
              label="Playing partner request"
              htmlFor="reg-partner"
              hint="We'll do our best when we build the groups."
            >
              <Input id="reg-partner" name="partner" placeholder="Who would you like to play with?" />
            </Field>
          ) : null}
        </CardBody>
      </Card>

      {/*
       * Payment appears only when there is payment. A club that doesn't take
       * money online never sees this block, and never sees a disabled version
       * of it either.
       */}
      {charging && fees ? (
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">Payment</h2>

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Entry fee</dt>
                <dd className="tabular-nums text-ink">{formatMoney(fees.entryFeeCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">
                  Divotz service fee
                  <span className="ml-1.5 text-ink-subtle">({formatRate(fees.feeRate)})</span>
                </dt>
                <dd className="tabular-nums text-ink">{formatMoney(fees.feeCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-semibold">
                <dt className="text-ink">Total</dt>
                <dd className="tabular-nums text-ink">{formatMoney(fees.totalCents)}</dd>
              </div>
            </dl>

            <p className="text-[13px] text-ink-muted leading-relaxed">
              {clubName} receives the entry fee. The service fee covers running Divotz.
            </p>

            {viewer?.savedPaymentMethod ? (
              <label className="flex items-center gap-3 rounded-xl border border-line-strong/40 p-4">
                <input
                  type="radio"
                  name="method"
                  defaultChecked
                  className="size-4 accent-[var(--club-primary)]"
                />
                <CreditCard className="size-4 text-ink-muted" aria-hidden />
                <span className="text-sm text-ink">
                  {viewer.savedPaymentMethod.brand} ending {viewer.savedPaymentMethod.last4}
                </span>
              </label>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card number" required htmlFor="reg-card">
                  <Input id="reg-card" inputMode="numeric" placeholder="4242 4242 4242 4242" required />
                </Field>
                <Field label="Expiry and CVC" required htmlFor="reg-exp">
                  <div className="flex gap-2">
                    <Input id="reg-exp" placeholder="MM / YY" required />
                    <Input placeholder="CVC" className="w-24" required />
                  </div>
                </Field>
              </div>
            )}
          </CardBody>
        </Card>
      ) : null}

      {paymentMode === "clubDirect" && fees && fees.entryFeeCents > 0 ? (
        <Callout tone="info" title={`Payment is handled directly by ${clubName}`}>
          The entry fee is {formatMoney(fees.entryFeeCents)}. We&apos;ll record your registration and
          the club will take payment their usual way.
        </Callout>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg">
          {waitlist
            ? "Join the waitlist"
            : charging && fees
              ? `Pay ${formatMoney(fees.totalCents)} and register`
              : needsApproval
                ? "Request a spot"
                : "Register"}
        </Button>
        <ButtonLink href={confirmationHref} variant="ghost">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
