import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { Field, Input } from "@/components/ui/form";
import { ClubMark } from "@/components/club/club-mark";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { updateBrandingAction } from "@/app/club/[slug]/admin/actions";
import { ColorFields } from "@/components/admin/color-fields";

export const metadata = { title: "Branding" };

/**
 * Branding.
 *
 * The logo lives at the top, with no Pro badge anywhere near it - every club,
 * on every plan, puts its own mark on its own site. Colours and photography
 * are Pro, and when a club doesn't have Pro this page says so once, in one
 * place, with a link. It does not stamp a lock on every control.
 */
export default async function Branding({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { club, basePath, denied } = await requireClubPermission(slug, "club.branding");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  const isPro = club.plan === "pro";

  return (
    <>
      <PageHeader title="Branding" description={`How ${club.name} looks on its own site.`} />

      {query.saved ? (
        <div className="mb-6">
          <Callout tone="success" title="Saved">
            Your branding is live.
          </Callout>
        </div>
      ) : null}

      <form action={updateBrandingAction} className="space-y-8">
        <input type="hidden" name="clubSlug" value={slug} />
        <input type="hidden" name="basePath" value={basePath} />

        <section>
          <SectionLabel>Logo</SectionLabel>
          <Card className="mt-3">
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <ClubMark club={club} size={56} />
                <div>
                  <p className="text-sm font-medium text-ink">Your club&apos;s mark</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    Appears on your site, your event pages, your scorecards and your emails.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Logo"
                  htmlFor="logoUrl"
                  hint="An SVG or PNG. Used wherever your club is named."
                >
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    defaultValue={club.branding.logoUrl ?? ""}
                    placeholder="/images/clubs/your-logo.svg"
                  />
                </Field>
                <Field label="Icon" htmlFor="iconUrl" hint="Square. Used as the browser tab icon.">
                  <Input
                    id="iconUrl"
                    name="iconUrl"
                    defaultValue={club.branding.iconUrl ?? ""}
                    placeholder="/images/clubs/your-icon.svg"
                  />
                </Field>
              </div>
            </CardBody>
          </Card>
        </section>

        <section>
          <SectionLabel>Colours and photography</SectionLabel>
          {!isPro ? (
            <p className="mt-2 mb-3 max-w-2xl text-sm text-ink-muted leading-relaxed">
              {club.name} runs on the free plan, which uses the standard Divotz palette.{" "}
              <Link href={href("/admin/pro")} className="underline underline-offset-2 hover:text-ink">
                See what Pro adds
              </Link>
              .
            </p>
          ) : (
            <p className="mt-1 mb-3 text-sm text-ink-muted">
              Pick your colours. Divotz works out the text colour that reads on each one.
            </p>
          )}

          {isPro ? (
            <Card className="mt-3">
              <CardBody className="space-y-6">
                <ColorFields
                  primary={club.branding.primaryColor}
                  secondary={club.branding.secondaryColor}
                  accent={club.branding.accentColor}
                />
                <Field
                  label="Hero image"
                  htmlFor="heroImageUrl"
                  hint="The photograph across the top of your club home page."
                >
                  <Input
                    id="heroImageUrl"
                    name="heroImageUrl"
                    defaultValue={club.branding.heroImageUrl ?? ""}
                    placeholder="/images/club-hero-placeholder.jpg"
                  />
                </Field>
              </CardBody>
            </Card>
          ) : null}
        </section>

        <Button type="submit" size="lg">
          Save branding
        </Button>
      </form>
    </>
  );
}
