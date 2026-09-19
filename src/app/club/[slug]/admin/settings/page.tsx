import { PageHeader } from "@/components/ui/page";
import { Callout } from "@/components/ui/status";
import { requireClubPermission } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { AccessDenied } from "@/components/club/access-denied";
import { ClubSettingsForms } from "@/components/admin/club-settings-forms";
import {
  updateClubProfileAction,
  updateDefaultsAction,
  updateFeaturesAction,
  updateNavigationAction,
} from "@/app/club/[slug]/admin/actions";

export const metadata = { title: "Settings" };

/**
 * Club settings.
 *
 * This is where a club says, once, how it normally operates - and where
 * turning something off makes it disappear from the rest of the product rather
 * than linger as a disabled control on every event.
 *
 * Ownership operations (delete, transfer) are deliberately not here. Those
 * live in the account area, away from day-to-day settings.
 */
export default async function ClubSettings({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { club, basePath, denied } = await requireClubPermission(slug, "club.manage");
  const href = (path: string) => joinClubPath(basePath, path);
  if (denied) return <AccessDenied clubName={club.name} homeHref={href("/")} />;

  return (
    <>
      <PageHeader
        title="Club settings"
        description="How your club works. Set it once here and every new event follows."
      />

      {query.saved ? (
        <div className="mb-6">
          <Callout tone="success" title="Saved">
            Your changes are live on {club.name}.
          </Callout>
        </div>
      ) : null}

      <ClubSettingsForms
        club={club}
        basePath={basePath}
        actions={{
          profile: updateClubProfileAction,
          features: updateFeaturesAction,
          defaults: updateDefaultsAction,
          navigation: updateNavigationAction,
        }}
      />
    </>
  );
}
