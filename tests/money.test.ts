/**
 * Fees.
 *
 * The rate is configurable and explicitly "not assumed to be 3%", so nothing
 * may hardcode it. These pin the arithmetic and, importantly, that the fee is
 * only ever added when Divotz is actually processing the payment.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { PLATFORM, computeFees, formatMoney, formatRate } from "../src/lib/domain/config.ts";

test("Divotz checkout adds the configured service fee on top of the entry fee", () => {
  const fees = computeFees(5000, "divotzCheckout");
  assert.equal(fees.entryFeeCents, 5000);
  assert.equal(fees.feeCents, Math.round(5000 * PLATFORM.serviceFeeRate));
  assert.equal(fees.totalCents, fees.entryFeeCents + fees.feeCents);
  assert.equal(fees.feeRate, PLATFORM.serviceFeeRate);
});

test("no fee is added when the club collects payment itself", () => {
  const fees = computeFees(5000, "clubDirect");
  assert.equal(fees.feeCents, 0);
  assert.equal(fees.totalCents, 5000, "the golfer owes the club exactly the entry fee");
});

test("no fee is added when the event takes no payment", () => {
  assert.equal(computeFees(5000, "none").feeCents, 0);
  assert.equal(computeFees(0, "divotzCheckout").feeCents, 0, "a free event is free");
});

test("the fee is floored so tiny entry fees still cover processing", () => {
  const fees = computeFees(100, "divotzCheckout");
  assert.equal(fees.feeCents, PLATFORM.serviceFeeMinimumCents);
});

test("the fee is capped so a large entry fee doesn't carry an absurd one", () => {
  const fees = computeFees(1_000_00, "divotzCheckout");
  assert.equal(fees.feeCents, PLATFORM.serviceFeeMaximumCents);
});

test("the total always equals entry plus fee, so no screen can disagree", () => {
  for (const amount of [0, 1, 250, 2500, 6000, 12500, 99999]) {
    const fees = computeFees(amount, "divotzCheckout");
    assert.equal(fees.totalCents, fees.entryFeeCents + fees.feeCents, `broke at ${amount}`);
  }
});

test("money and rates format for display without drifting", () => {
  assert.match(formatMoney(5175), /51\.75/);
  assert.equal(formatRate(0.03), "3%");
  assert.equal(formatRate(0.035), "3.5%");
});
