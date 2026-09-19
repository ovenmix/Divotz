/**
 * Membership and imports.
 *
 * Two things here protect real club data: an "active" row that expired months
 * ago is not an active membership, and a re-import must match people rather
 * than quietly creating a second copy of everyone.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildImportPreview,
  expiryState,
  guessColumn,
  isActiveMember,
  parseCsv,
  type ImportColumn,
} from "../src/lib/domain/membership.ts";

const NOW = new Date("2026-09-19");

test("membership needs both an active status and an unexpired date", () => {
  assert.equal(isActiveMember({ status: "active", expiresAt: "2027-05-31" }, NOW), true);
  // The row still says active, but the date has passed. It is not active.
  assert.equal(isActiveMember({ status: "active", expiresAt: "2026-05-31" }, NOW), false);
  assert.equal(isActiveMember({ status: "expired", expiresAt: "2027-05-31" }, NOW), false);
  assert.equal(isActiveMember({ status: "suspended", expiresAt: "2027-05-31" }, NOW), false);
  assert.equal(isActiveMember(null, NOW), false);
});

test("a membership with no expiry on file is still active", () => {
  assert.equal(isActiveMember({ status: "active", expiresAt: null }, NOW), true);
  assert.equal(expiryState({ expiresAt: null }, NOW), "none");
});

test("expiry has three distinguishable states, not just good and bad", () => {
  assert.equal(expiryState({ expiresAt: "2027-05-31" }, NOW), "active");
  assert.equal(expiryState({ expiresAt: "2026-10-15" }, NOW), "expiringSoon");
  assert.equal(expiryState({ expiresAt: "2026-05-31" }, NOW), "expired");
});

test("CSV parsing survives quoted fields, embedded commas and CRLF", () => {
  const rows = parseCsv('Name,Email\r\n"Wilson, Dave",dave@example.com\r\n"He said ""hi""",x@y.co\r\n');
  assert.deepEqual(rows[1], ["Wilson, Dave", "dave@example.com"]);
  assert.deepEqual(rows[2], ['He said "hi"', "x@y.co"]);
});

test("column guessing handles the headers clubs actually use", () => {
  assert.equal(guessColumn("Email Address"), "email");
  assert.equal(guessColumn("Handicap Index"), "handicap");
  assert.equal(guessColumn("Membership Expiry"), "expiresAt");
  assert.equal(guessColumn("Full Name"), "name");
  assert.equal(guessColumn("Locker #"), "ignore");
});

const MAPPING: ImportColumn[] = ["name", "email", "handicap", "expiresAt"];
const EXISTING = [{ id: "m_1", email: "sarah@example.com", name: "Sarah Brown" }];

test("a re-import matches existing members by email instead of duplicating them", () => {
  const preview = buildImportPreview(
    [
      ["Sarah Brown", "sarah@example.com", "14.2", "2027-05-31"],
      ["Priya Raman", "priya@example.com", "17.5", "2027-05-31"],
    ],
    MAPPING,
    EXISTING,
  );
  assert.equal(preview.updateCount, 1);
  assert.equal(preview.newCount, 1);
  assert.equal(preview.rows[0].matchedMemberId, "m_1");
});

test("rows we cannot act on confidently are flagged rather than guessed at", () => {
  const preview = buildImportPreview(
    [
      ["", "noname@example.com", "", ""],
      ["No Email", "", "", ""],
      ["Bad Email", "not-an-email", "", ""],
      ["Bad Handicap", "h@example.com", "scratch", ""],
      ["Bad Date", "d@example.com", "", "whenever"],
    ],
    MAPPING,
    [],
  );
  assert.equal(preview.attentionCount, 5);
  assert.equal(preview.newCount, 0);
});

test("a duplicate inside the file is caught, not imported twice", () => {
  const preview = buildImportPreview(
    [
      ["Dave Wilson", "dave@example.com", "", ""],
      ["Dave Wilson", "dave@example.com", "", ""],
    ],
    MAPPING,
    [],
  );
  assert.equal(preview.rows[0].outcome, "create");
  assert.equal(preview.rows[1].outcome, "attention");
  assert.ok(preview.rows[1].notes.some((n) => /Duplicated/.test(n)));
});

test("matching is case-insensitive, because spreadsheets are not consistent", () => {
  const preview = buildImportPreview([["Sarah Brown", "SARAH@EXAMPLE.COM", "", ""]], MAPPING, EXISTING);
  assert.equal(preview.updateCount, 1);
});

test("names alone never merge two people", () => {
  // Two Dave Wilsons at one club is ordinary. Only email may link records.
  const preview = buildImportPreview(
    [["Sarah Brown", "different@example.com", "", ""]],
    MAPPING,
    EXISTING,
  );
  assert.equal(preview.newCount, 1);
  assert.equal(preview.updateCount, 0);
});
