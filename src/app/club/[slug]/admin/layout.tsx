import { SidebarLayer, SidebarLayerMobile } from "@/components/nav/sidebar";
import { resolveClub } from "@/lib/club-request";
import { buildAdminNav, canSeeAdmin } from "@/lib/navigation";
import { AccessDenied } from "@/components/club/access-denied";
import { redirect } from "next/navigation";
import Link from "next/link";
import { joinClubPath } from "@/lib/club-path";
import { StatusPill } from "@/components/ui/status";

/**
 * The admin layer.
 *
 * This is a second sidebar beside the club's, not a separate product. The club
 * sidebar stays exactly where it was, the admin column opens next to it, and
 * the URL stays on the club's own domain. An admin never leaves their club to
 * administer their club.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { club, access, basePath, currentPath } = await resolveClub(slug);

  if (!access.signedIn) {
    redirect(`${basePath}/sign-in?next=${encodeURIComponent(currentPath)}`);
  }

  if (!canSeeAdmin(access)) {
    return <AccessDenied clubName={club.name} homeHref={joinClubPath(basePath, "/")} />;
  }

  const sections = buildAdminNav(club, access);

  return (
    <>
      <SidebarLayer
        title="Admin"
        backHref="/"
        backLabel={club.name}
        sections={sections}
        basePath={basePath}
        footer={
          <div className="flex items-center justify-between gap-2">
            <Link
              href={joinClubPath(basePath, "/admin/pro")}
              className="text-[12px] text-ink-muted hover:text-ink"
            >
              {club.plan === "pro" ? "Pro" : "Free plan"}
            </Link>
            {club.plan === "pro" ? <StatusPill tone="quiet">Pro</StatusPill> : null}
          </div>
        }
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <SidebarLayerMobile sections={sections} basePath={basePath} label="Admin" />
        <main className="flex-1 px-5 py-7 lg:px-9 lg:py-9">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </>
  );
}
