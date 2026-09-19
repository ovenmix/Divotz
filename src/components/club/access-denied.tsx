import { ButtonLink } from "@/components/ui/button";

/**
 * Someone signed in who can't reach this page.
 *
 * Told plainly rather than bounced somewhere else, because a silent redirect
 * reads like a bug to the person it happens to.
 */
export function AccessDenied({ clubName, homeHref }: { clubName: string; homeHref: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-5 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-ink-muted">That&apos;s a members-only cart path.</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">You don&apos;t have access to this page</h1>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          Your account doesn&apos;t have permission to manage {clubName}. If that looks wrong, the
          club owner can change what you can reach under Admin → Staff.
        </p>
        <ButtonLink href={homeHref} className="mt-6">
          Back to the clubhouse
        </ButtonLink>
      </div>
    </div>
  );
}
