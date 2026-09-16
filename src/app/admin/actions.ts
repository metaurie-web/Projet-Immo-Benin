"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { setListingStatus } from "@/lib/data";
import type { ListingStatus } from "@/lib/types";

export type ModerationOutcome = "valid" | "fix" | "reject";

const OUTCOME_TO_STATUS: Record<ModerationOutcome, ListingStatus> = {
  valid: "en_ligne",
  fix: "correction_demandee",
  reject: "refusee",
};

export type ModerationResult = { ok: true } | { ok: false; error: string };

/** Change le statut d'une annonce depuis la file de modération.
 *  Réservé aux comptes dont le rôle est "admin" (vérifié ici, pas seulement
 *  côté page : une action serveur est un point d'entrée public). */
export async function moderateListing(
  ref: string,
  outcome: ModerationOutcome,
): Promise<ModerationResult> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return { ok: false, error: "Action réservée aux administrateurs." };
  }

  await setListingStatus(ref, OUTCOME_TO_STATUS[outcome]);

  // Les pages ci-dessous affichent des annonces : on les force à se
  // recalculer pour refléter le nouveau statut sans attendre.
  revalidatePath("/admin");
  revalidatePath("/annonces");
  revalidatePath("/");
  revalidatePath("/espace-proprietaire");

  return { ok: true };
}
