import type { EventFormat, EventStatus } from "./types";

export const FORMAT_LABELS: Record<EventFormat, string> = {
  strokePlay: "Stroke play",
  scramble: "Scramble",
  bestBall: "Best ball",
  stableford: "Stableford",
  matchPlay: "Match play",
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  open: "Open",
  closed: "Closed",
  inProgress: "In progress",
  complete: "Complete",
  cancelled: "Cancelled",
};
