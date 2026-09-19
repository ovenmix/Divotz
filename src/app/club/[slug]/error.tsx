"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/brand/error-page";
import { Button } from "@/components/ui/button";
import { errorCopy, errorReference } from "@/lib/copy";

export default function ClubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const seed = error.digest ?? error.name;
  const copy = errorCopy(seed);

  return (
    <ErrorPage
      headline={copy.headline}
      explanation={copy.explanation}
      reference={errorReference(seed)}
      technical={error.name}
      actionHref="/"
      actionLabel="Back to the clubhouse"
      secondary={
        <Button variant="outline" size="lg" onClick={reset}>
          Try that again
        </Button>
      }
    />
  );
}
