"use client";

import { createContext, useContext, type ReactNode } from "react";
import { joinClubPath } from "./club-path";
import type { Club } from "./domain/types";

export type ClubContextValue = {
  club: Club;
  /** "" on a club host, "/club/<slug>" when reached through the path form. */
  basePath: string;
  isStaff: boolean;
  isOwner: boolean;
  signedIn: boolean;
};

const ClubContext = createContext<ClubContextValue | null>(null);

export function ClubProvider({ value, children }: { value: ClubContextValue; children: ReactNode }) {
  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export function useClub(): ClubContextValue {
  const value = useContext(ClubContext);
  if (!value) throw new Error("useClub must be used inside a ClubProvider");
  return value;
}

export function useClubHref(): (path: string) => string {
  const { basePath } = useClub();
  return (path: string) => joinClubPath(basePath, path);
}
