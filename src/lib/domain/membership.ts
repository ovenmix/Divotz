/**
 * Membership, which is not the same thing as having an account.
 *
 * A members-only event checks *membership*, not whether somebody managed to
 * sign up for Divotz. Those are different questions and conflating them is how
 * a non-member ends up in a members-only field.
 */

import type { Member, MembershipStatus } from "./types";

export const MEMBERSHIP_LABELS: Record<MembershipStatus, string> = {
  active: "Active",
  expired: "Expired",
  pending: "Pending",
  suspended: "Suspended",
};

export type ExpiryState = "none" | "active" | "expiringSoon" | "expired";

const DAY = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 45;

export function expiryState(member: Pick<Member, "expiresAt">, now = new Date()): ExpiryState {
  if (!member.expiresAt) return "none";
  const expires = new Date(member.expiresAt).getTime();
  if (Number.isNaN(expires)) return "none";
  const remaining = expires - now.getTime();
  if (remaining <= 0) return "expired";
  if (remaining <= EXPIRING_SOON_DAYS * DAY) return "expiringSoon";
  return "active";
}

/**
 * The single answer to "can this person register as a member?".
 *
 * Both the stored status and the expiry date have to agree. A roster row that
 * still says "active" but expired in May is not an active membership.
 */
export function isActiveMember(member: Pick<Member, "status" | "expiresAt"> | null | undefined, now = new Date()): boolean {
  if (!member) return false;
  if (member.status !== "active") return false;
  return expiryState(member, now) !== "expired";
}

export function membershipSummary(member: Member, now = new Date()): { label: string; detail: string } {
  const state = expiryState(member, now);
  if (member.status === "suspended") return { label: "Suspended", detail: "Membership suspended by the club." };
  if (member.status === "pending") return { label: "Pending", detail: "Waiting on the club to confirm." };
  if (state === "expired") {
    return { label: "Expired", detail: `Expired ${formatDate(member.expiresAt!)}` };
  }
  if (state === "expiringSoon") {
    return { label: "Expires soon", detail: `Expires ${formatDate(member.expiresAt!)}` };
  }
  if (state === "none") return { label: "Active", detail: "No expiry date on file" };
  return { label: "Active", detail: `Expires ${formatDate(member.expiresAt!)}` };
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

/* --------------------------------------------------------------- CSV import */

export type ImportColumn = "name" | "email" | "phone" | "handicap" | "expiresAt" | "ignore";

export const IMPORT_COLUMN_LABELS: Record<ImportColumn, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  handicap: "Handicap",
  expiresAt: "Membership expiry",
  ignore: "Don't import",
};

/** Header guesses, so most clubs never touch the mapping step. */
const HEADER_HINTS: Record<ImportColumn, string[]> = {
  name: ["name", "full name", "member", "member name", "golfer"],
  email: ["email", "e-mail", "email address"],
  phone: ["phone", "mobile", "cell", "telephone", "phone number"],
  handicap: ["handicap", "hcp", "index", "handicap index"],
  expiresAt: ["expiry", "expires", "expiration", "renewal", "valid until", "membership expiry"],
  ignore: [],
};

export function guessColumn(header: string): ImportColumn {
  const normalized = header.trim().toLowerCase();
  for (const [column, hints] of Object.entries(HEADER_HINTS) as [ImportColumn, string[]][]) {
    if (hints.includes(normalized)) return column;
  }
  for (const [column, hints] of Object.entries(HEADER_HINTS) as [ImportColumn, string[]][]) {
    if (hints.some((hint) => normalized.includes(hint))) return column;
  }
  return "ignore";
}

/** Minimal CSV reader: handles quoted fields, escaped quotes and CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += char;
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type ImportRow = {
  index: number;
  name: string;
  email: string;
  phone?: string;
  handicap?: number | null;
  expiresAt?: string | null;
  /** What will happen to this row on confirm. */
  outcome: "create" | "update" | "attention";
  /** Why it needs attention, or what will be updated. */
  notes: string[];
  matchedMemberId?: string;
};

export type ImportPreview = {
  rows: ImportRow[];
  newCount: number;
  updateCount: number;
  attentionCount: number;
};

/**
 * Work out what an import would do before it does it.
 *
 * Matching is by email first - it is the only identifier a club's spreadsheet
 * reliably shares with our records. Names collide (two Dave Wilsons) and are
 * never used alone to merge rows.
 */
export function buildImportPreview(
  rows: string[][],
  mapping: ImportColumn[],
  existing: Pick<Member, "id" | "email" | "name">[],
): ImportPreview {
  const byEmail = new Map(existing.map((m) => [m.email.trim().toLowerCase(), m]));
  const seenInFile = new Set<string>();
  const preview: ImportRow[] = [];

  rows.forEach((cells, index) => {
    const get = (column: ImportColumn) => {
      const at = mapping.indexOf(column);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };

    const name = get("name");
    const email = get("email").toLowerCase();
    const handicapRaw = get("handicap");
    const expiryRaw = get("expiresAt");
    const notes: string[] = [];

    let outcome: ImportRow["outcome"] = "create";
    let matchedMemberId: string | undefined;

    /*
     * Whether a row is importable is tracked as a flag, never inferred from
     * the wording of its note. Deriving it from prose means a reworded message
     * silently starts importing rows a human was supposed to look at.
     */
    let blocked = false;
    const block = (note: string) => {
      notes.push(note);
      blocked = true;
    };

    if (!name) block("Missing name");
    if (!email) block("Missing email");
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) block("Email doesn't look valid");
    else if (seenInFile.has(email)) block("Duplicated earlier in this file");

    const handicap = handicapRaw === "" ? null : Number(handicapRaw);
    if (handicapRaw !== "" && !Number.isFinite(handicap)) {
      block(`Handicap "${handicapRaw}" isn't a number`);
    }

    let expiresAt: string | null = null;
    if (expiryRaw) {
      const parsed = new Date(expiryRaw);
      if (Number.isNaN(parsed.getTime())) block(`Expiry "${expiryRaw}" isn't a date we recognise`);
      else expiresAt = parsed.toISOString().slice(0, 10);
    }

    if (email && !seenInFile.has(email)) seenInFile.add(email);

    const match = email ? byEmail.get(email) : undefined;
    if (match) {
      outcome = "update";
      matchedMemberId = match.id;
      notes.push(`Matches existing member ${match.name}`);
    }

    // Anything we can't act on confidently needs a human, not a guess.
    if (blocked) outcome = "attention";

    preview.push({
      index,
      name,
      email,
      phone: get("phone") || undefined,
      handicap: Number.isFinite(handicap) ? (handicap as number) : null,
      expiresAt,
      outcome,
      notes,
      matchedMemberId,
    });
  });

  return {
    rows: preview,
    newCount: preview.filter((r) => r.outcome === "create").length,
    updateCount: preview.filter((r) => r.outcome === "update").length,
    attentionCount: preview.filter((r) => r.outcome === "attention").length,
  };
}
