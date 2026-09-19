import { ErrorPage } from "@/components/brand/error-page";
import { notFoundCopy } from "@/lib/copy";

/**
 * A 404 inside a club.
 *
 * Kept separate from the platform 404 so the way back points at the club the
 * visitor was actually trying to use.
 */
export default function ClubNotFound() {
  const copy = notFoundCopy("club-404");
  return (
    <ErrorPage
      code="404"
      headline={copy.headline}
      explanation={copy.explanation}
      actionHref="/"
      actionLabel="Back to the clubhouse"
    />
  );
}
