"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClub, createTournament, getClubBySlug } from "@/lib/domain/repository";
import type { EventFormat } from "@/lib/domain/types";

export async function createClubAction(formData: FormData) {
  const user = await requireSession("/dashboard/create-club");
  const slug = String(formData.get("slug") ?? "").trim();

  // A club's address is its identity. Two clubs cannot share one.
  const existing = await getClubBySlug(slug);
  if (existing) {
    redirect(`/dashboard/create-club?error=taken&slug=${encodeURIComponent(slug)}`);
  }

  const club = await createClub({
    name: String(formData.get("name") ?? "").trim(),
    slug,
    ownerId: user.id,
    location: String(formData.get("location") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
  });

  revalidatePath("/dashboard");
  // Straight into the club. The platform shell's job is done.
  redirect(`/club/${club.slug}/admin`);
}

export async function createStandaloneTournamentAction(formData: FormData) {
  await requireSession("/dashboard/create-tournament");
  const name = String(formData.get("name") ?? "").trim();
  const fee = String(formData.get("fee") ?? "").trim();

  const tournament = await createTournament({
    clubId: null,
    name,
    slug: name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    date: String(formData.get("date") ?? ""),
    format: String(formData.get("format") ?? "scramble") as EventFormat,
    description: String(formData.get("description") ?? "").trim() || undefined,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
    entryFeeCents: fee ? Math.round(Number(fee) * 100) : null,
  });

  revalidatePath("/dashboard/tournaments");
  redirect(`/dashboard/tournaments/${tournament.slug}`);
}
