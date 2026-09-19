/**
 * The Divotz mark.
 *
 * A ball on a tee cut by the divot the name comes from. Kept as one component
 * so it's reused rather than redrawn, and so the real artwork can replace it
 * in a single place.
 */
export function DivotzMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Divotz"
      className={className}
    >
      <rect width="32" height="32" rx="8" className="fill-green-800" />
      <circle cx="16" cy="13" r="6" className="fill-cream-100" />
      <circle cx="13.6" cy="11.4" r="0.9" className="fill-green-100" />
      <circle cx="16.6" cy="10.6" r="0.9" className="fill-green-100" />
      <circle cx="18.2" cy="13.4" r="0.9" className="fill-green-100" />
      <circle cx="14.6" cy="14.6" r="0.9" className="fill-green-100" />
      <path
        d="M6 24c2.6-2.4 5.5-3.6 8.6-3.6 1.4 0 2.6.2 3.6.6 1.7.7 3.6.7 5.6 0l2.2-.8"
        className="stroke-sand-500"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
