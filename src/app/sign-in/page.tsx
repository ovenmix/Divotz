import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Callout } from "@/components/ui/status";
import { DivotzMark } from "@/components/brand/divotz-mark";
import { signInAction } from "@/app/actions";
import { safeReturnTo } from "@/lib/auth";
import { USERS } from "@/lib/domain/seed";

export const metadata = { title: "Sign in" };

/**
 * Platform sign-in.
 *
 * Only for account-level things. Anything that starts at a club signs in at
 * that club instead, so the golfer never bounces out to divotz.ca and back.
 */
export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const query = await searchParams;
  const next = safeReturnTo(query.next, "/dashboard");

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <DivotzMark size={40} />
          <h1 className="mt-4 text-xl font-semibold text-ink">Sign in to Divotz</h1>
        </div>

        {query.error ? (
          <div className="mb-4">
            <Callout tone="warning" title="We don't know that email">
              There&apos;s no Divotz account with that address.
            </Callout>
          </div>
        ) : null}

        <Card>
          <CardBody>
            <form action={signInAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <input type="hidden" name="retry" value="/sign-in" />
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
      </div>
    </div>
  );
}
