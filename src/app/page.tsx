import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DivotzMark } from "@/components/brand/divotz-mark";
import { getSession } from "@/lib/auth";
import { CLUBS } from "@/lib/domain/seed";
import { PLATFORM } from "@/lib/domain/config";

/**
 * divotz.ca itself.
 *
 * Most people will never see this page - they'll go straight to their club's
 * address and stay there. This is for someone who hasn't got a club yet.
 */
export default async function Home() {
  const user = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-5 lg:px-10">
        <span className="flex items-center gap-2.5">
          <DivotzMark size={30} />
          <span className="text-sm font-semibold tracking-tight text-ink">Divotz</span>
        </span>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <ButtonLink href="/dashboard" variant="outline" size="sm">
              Your Divotz
            </ButtonLink>
          ) : (
            <ButtonLink href="/sign-in" variant="outline" size="sm">
              Sign in
            </ButtonLink>
          )}
        </nav>
      </header>

      <main className="flex-1 px-5 py-14 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-6xl">
            Your club&apos;s digital clubhouse.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            Tournaments, leagues, members, tee sheets and payments - at your club&apos;s own
            address, looking like your club. Divotz handles the grunt work underneath.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/create-club" size="lg">
              Create your club
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/dashboard/create-tournament" variant="outline" size="lg">
              Run a one-off tournament
            </ButtonLink>
          </div>

          <section className="mt-16 border-t border-line pt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Clubs on Divotz
            </p>
            <ul className="mt-4 space-y-2">
              {CLUBS.map((club) => (
                <li key={club.id}>
                  <Link
                    href={`/club/${club.slug}`}
                    className="group inline-flex items-center gap-2 text-sm text-ink hover:underline underline-offset-2"
                  >
                    <span className="font-medium">{club.name}</span>
                    <span className="text-ink-subtle">
                      {club.slug}.{PLATFORM.rootDomain}
                    </span>
                    <ArrowRight
                      className="size-3.5 text-ink-subtle transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-xl text-[13px] text-ink-muted leading-relaxed">
              Each club runs at its own address. A golfer bookmarks that and never has to know
              Divotz is underneath.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-line px-5 py-6 lg:px-10">
        <p className="text-[12px] text-ink-subtle">Divotz</p>
      </footer>
    </div>
  );
}
