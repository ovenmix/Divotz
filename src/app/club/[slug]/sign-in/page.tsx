import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Callout } from "@/components/ui/status";
import { ClubMark } from "@/components/club/club-mark";
import { ClubFooter } from "@/components/club/club-shell";
import { resolveClub } from "@/lib/club-request";
import { joinClubPath } from "@/lib/club-path";
import { signInAction } from "@/app/actions";
import { USERS } from "@/lib/domain/seed";

export const metadata = { title: "Sign in" };

/**
 * The club's sign-in.
 *
 * Branded as the club, because from the golfer's side this is their club's
 * login, not a Divotz login. Whatever they were doing is carried through in
 * `next` and they are put straight back there afterwards.
 *
 * No identity provider is wired up yet, so this is an explicit account picker
 * and says so rather than miming a password check.
 */
export default async function ClubSignIn({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { club, basePath } = await resolveClub(slug);
  const href = (path: string) => joinClubPath(basePath, path);
  const next = query.next ?? href("/");

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <ClubMark club={club} size={52} />
            <h1 className="mt-4 text-xl font-semibold text-ink">Sign in to {club.name}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Back to the clubhouse. We&apos;ll return you to where you were.
            </p>
          </div>

          {query.error ? (
            <div className="mb-4">
              <Callout tone="warning" title="We don't know that email">
                No account here with that address. Try another, or register as a guest - most
                events don&apos;t need an account.
              </Callout>
            </div>
          ) : null}

          <Card>
            <CardBody>
              <form action={signInAction} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <input type="hidden" name="retry" value={href("/sign-in")} />
                <Field label="Email" htmlFor="email" required>
                  <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
                </Field>
                <Button type="submit" className="w-full" size="lg">
                  Sign in
                </Button>
              </form>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[12px] font-medium text-ink-muted">
                  Demo accounts (no auth provider connected yet)
                </p>
                <ul className="mt-2 space-y-1">
                  {USERS.slice(0, 4).map((user) => (
                    <li key={user.id} className="text-[13px] text-ink-subtle">
                      <span className="text-ink-muted">{user.email}</span> — {user.name}
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>

          <p className="mt-5 text-center text-[13px] text-ink-muted">
            Just here to look around?{" "}
            <a href={href("/")} className="underline underline-offset-2 hover:text-ink">
              Back to {club.name}
            </a>
          </p>
        </div>
      </main>
      <ClubFooter />
    </div>
  );
}
