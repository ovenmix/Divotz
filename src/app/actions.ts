"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, safeReturnTo, setSession } from "@/lib/auth";
import { getUserByEmail } from "@/lib/domain/repository";

/**
 * Sign in, and go back where you came from.
 *
 * The return trip is the whole point: somebody who clicked "Register" on
 * Men's Night lands back on Men's Night, not on a platform dashboard they
 * never asked to see.
 */
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const next = safeReturnTo(String(formData.get("next") ?? ""), "/dashboard");

  const user = await getUserByEmail(email);
  if (!user) {
    redirect(`${String(formData.get("retry") ?? "/sign-in")}?error=unknown&next=${encodeURIComponent(next)}`);
  }

  await setSession(user.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction(formData: FormData) {
  await clearSession();
  revalidatePath("/", "layout");
  redirect(safeReturnTo(String(formData.get("next") ?? ""), "/"));
}
