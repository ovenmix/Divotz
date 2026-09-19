"use client";

import { useFormStatus } from "react-dom";
import { loadingCopy } from "@/lib/copy";

/**
 * Loading copy, used where it's safe to use it.
 *
 * Deliberately no route-level `loading.tsx` anywhere in this app. A route
 * loading file wraps its subtree in Suspense, which makes Next flush a 200
 * response before the page has decided anything - and a page that then calls
 * `notFound()` or `redirect()` can no longer set the right status. A missing
 * club has to be a real 404, so the loading flourish lives in client-side
 * pending states instead, where it costs nothing.
 */
export function LoadingLine({ seed = "divotz" }: { seed?: string }) {
  return (
    <p className="text-sm text-ink-muted" role="status">
      {loadingCopy(seed)}
    </p>
  );
}

/** A submit button that says something while the server is thinking. */
export function PendingLabel({ idle, seed = "divotz" }: { idle: string; seed?: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? loadingCopy(seed) : idle}</>;
}
