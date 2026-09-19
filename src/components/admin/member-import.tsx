"use client";

import { useMemo, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Callout, StatusPill } from "@/components/ui/status";
import { SectionLabel } from "@/components/ui/page";
import {
  buildImportPreview,
  guessColumn,
  IMPORT_COLUMN_LABELS,
  parseCsv,
  type ImportColumn,
} from "@/lib/domain/membership";

type Step = "upload" | "map" | "preview" | "done";

/**
 * CSV import, in the order a club actually thinks about it:
 *
 *   upload -> we guess the columns -> they check our guesses -> they see
 *   exactly what will happen -> confirm.
 *
 * The preview is the point. "42 new, 6 to update, 2 need attention" is what
 * lets somebody import a real membership list without holding their breath -
 * and matching on email is what stops a re-import creating a second Dave Wilson.
 */
export function MemberImport({
  existing,
  membersHref,
}: {
  existing: { id: string; email: string; name: string }[];
  membersHref: string;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ImportColumn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => (rows.length ? buildImportPreview(rows, mapping, existing) : null),
    [rows, mapping, existing],
  );

  async function handleFile(file: File) {
    setError(null);
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      setError("That file doesn't have a header row and at least one member.");
      return;
    }
    const [head, ...body] = parsed;
    setHeaders(head);
    setRows(body);
    // Guess first so most clubs can skip straight past the mapping step.
    setMapping(head.map((column) => guessColumn(column)));
    setStep("map");
  }

  if (step === "done" && preview) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <h2 className="text-xl font-semibold text-ink">Members imported.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted leading-relaxed">
            {preview.newCount} added and {preview.updateCount} updated. Anyone who signs up with a
            matching email will be linked to their membership automatically.
          </p>
          <ButtonLink href={membersHref} className="mt-6">
            Back to members
          </ButtonLink>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Steps step={step} />

      {error ? <Callout tone="warning">{error}</Callout> : null}

      {step === "upload" ? (
        <Card>
          <CardBody>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong/50 px-6 py-12 text-center hover:bg-cream-500/40 transition-colors">
              <FileUp className="size-8 text-ink-subtle" aria-hidden />
              <span className="mt-3 text-sm font-medium text-ink">Choose a CSV file</span>
              <span className="mt-1 text-[13px] text-ink-muted">
                Name, email, phone, handicap and membership expiry.
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </CardBody>
        </Card>
      ) : null}

      {step === "map" ? (
        <Card>
          <CardBody>
            <SectionLabel>Match your columns</SectionLabel>
            <p className="mt-1 mb-4 text-sm text-ink-muted">
              We&apos;ve had a guess from your headers. Change anything we got wrong.
            </p>
            <ul className="space-y-3">
              {headers.map((header, index) => (
                <li key={`${header}-${index}`} className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{header}</span>
                    <span className="block truncate text-[13px] text-ink-subtle">
                      e.g. {rows[0]?.[index] || "—"}
                    </span>
                  </span>
                  <Select
                    value={mapping[index]}
                    onChange={(e) => {
                      const next = [...mapping];
                      next[index] = e.target.value as ImportColumn;
                      setMapping(next);
                    }}
                    className="w-48"
                    aria-label={`Map column ${header}`}
                  >
                    {(Object.keys(IMPORT_COLUMN_LABELS) as ImportColumn[]).map((column) => (
                      <option key={column} value={column}>
                        {IMPORT_COLUMN_LABELS[column]}
                      </option>
                    ))}
                  </Select>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setStep("preview")}>Preview import</Button>
              <Button variant="ghost" onClick={() => setStep("upload")}>
                Choose another file
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === "preview" && preview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Summary label="New members" value={preview.newCount} tone="success" />
            <Summary label="Existing to update" value={preview.updateCount} tone="info" />
            <Summary
              label="Need attention"
              value={preview.attentionCount}
              tone={preview.attentionCount > 0 ? "warning" : "neutral"}
            />
          </div>

          <Card>
            <div className="max-h-[28rem] overflow-y-auto">
              <ul className="divide-y divide-line">
                {preview.rows.map((row) => (
                  <li key={row.index} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">{row.name || "(no name)"}</span>
                      <span className="block text-[13px] text-ink-muted">
                        {row.email || "(no email)"}
                      </span>
                      {row.notes.length > 0 ? (
                        <span className="mt-0.5 block text-[12px] text-ink-subtle">
                          {row.notes.join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <StatusPill
                      tone={
                        row.outcome === "create"
                          ? "success"
                          : row.outcome === "update"
                            ? "info"
                            : "warning"
                      }
                    >
                      {row.outcome === "create"
                        ? "New"
                        : row.outcome === "update"
                          ? "Update"
                          : "Needs attention"}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {preview.attentionCount > 0 ? (
            <Callout tone="warning" title={`${preview.attentionCount} rows won't be imported`}>
              Rows missing a name or email, with an unreadable date, or duplicated inside the file
              are skipped. Fix them in your spreadsheet and import again - the ones that went in
              will be matched, not duplicated.
            </Callout>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setStep("done")}>
              <Upload className="size-4" aria-hidden />
              Import {preview.newCount + preview.updateCount} members
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setStep("map")}>
              Back to mapping
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "upload", label: "Upload" },
    { id: "map", label: "Match columns" },
    { id: "preview", label: "Review" },
  ];
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <ol className="flex flex-wrap items-center gap-2 text-[13px]">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          {i > 0 ? <span className="text-ink-subtle">→</span> : null}
          <span
            className={
              i <= currentIndex ? "font-medium text-ink" : "text-ink-subtle"
            }
          >
            {i + 1}. {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "info" | "warning" | "neutral";
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </p>
        <p className="mt-1.5 flex items-center gap-2">
          <span className="text-2xl font-semibold text-ink tabular-nums">{value}</span>
          {value > 0 ? <StatusPill tone={tone}>{label}</StatusPill> : null}
        </p>
      </CardBody>
    </Card>
  );
}
