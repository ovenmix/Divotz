import { ErrorPage } from "@/components/brand/error-page";
import { notFoundCopy } from "@/lib/copy";

export default function NotFound() {
  const copy = notFoundCopy("404");
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
