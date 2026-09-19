"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/brand/error-page";
import { errorCopy, errorReference } from "@/lib/copy";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Real reporting goes here. The user never sees a stack trace.
    console.error(error);
  }, [error]);

  // Seeded from the digest so the same failure shows the same line rather than
  // a fresh joke on every render.
  const seed = error.digest ?? error.name;
  const copy = errorCopy(seed);

  return (
    <ErrorPage
      headline={copy.headline}
      explanation={copy.explanation}
      reference={errorReference(seed)}
      technical={error.name}
      secondary={
        <Button variant="outline" size="lg" onClick={reset}>
          Try that again
        </Button>
      }
    />
  );
}
