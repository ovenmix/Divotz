import type { Metadata } from "next";
import { ClubProvider } from "@/lib/club-context";
import { ClubTheme } from "@/components/club/club-theme";
import { ClubSidebar } from "@/components/nav/club-sidebar";
import { ClubTopbar } from "@/components/nav/club-topbar";
import { resolveClub } from "@/lib/club-request";
import { buildClubNav, buildMyGolfNav, canSeeAdmin } from "@/lib/navigation";
import { clubIcon } from "@/lib/domain/branding";

/**
 * The club shell.
 *
 * Everything below this layout is the club's own site. Divotz appears once, in
 * small type at the bottom - it powers the experience without being it.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { club } = await resolveClub(slug);
  const icon = clubIcon(club);

  return {
    /*
     * `absolute` so the root layout's "%s · Divotz" template does not apply.
     * The browser tab reads "Gleniffer Golf", not "Gleniffer Golf · Divotz" -
     * this is the club's site and the tab should say so.
     */
    title: { absolute: club.name, template: `%s · ${club.name}` },
    description: club.description,
    // A club's own favicon, which is part of the free tier.
    icons: icon ? { icon } : undefined,
  };
}

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { club, user, access, basePath } = await resolveClub(slug);

  const items = buildClubNav(club, access);
  const myGolf = buildMyGolfNav(access);
  const showAdmin = canSeeAdmin(access);
  const viewer = user ? { name: user.name } : null;

  return (
    <ClubTheme club={club}>
      <ClubProvider
        value={{
          club,
          basePath,
          isStaff: access.isStaff,
          isOwner: access.isOwner,
          signedIn: access.signedIn,
        }}
      >
        <div className="flex min-h-dvh flex-col lg:flex-row">
          <ClubSidebar items={items} myGolf={myGolf} showAdmin={showAdmin} user={viewer} />
          <ClubTopbar items={items} myGolf={myGolf} showAdmin={showAdmin} user={viewer} />
          <div className="flex min-w-0 flex-1 flex-col lg:flex-row">{children}</div>
        </div>
      </ClubProvider>
    </ClubTheme>
  );
}
