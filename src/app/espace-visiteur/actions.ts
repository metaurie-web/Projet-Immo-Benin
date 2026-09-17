"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ToggleFavoriteResult = { ok: true; favorited: boolean } | { ok: false; error: string };

/** Ajoute ou retire une annonce des favoris du compte connecté.
 *  Utilisable depuis n'importe quelle carte/fiche d'annonce, pas seulement
 *  depuis /espace-visiteur. */
export async function toggleFavorite(listingRef: string): Promise<ToggleFavoriteResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Connexion requise." };

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingRef: { userId: session.user.id, listingRef } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, listingRef } });
  }

  revalidatePath("/espace-visiteur");
  return { ok: true, favorited: !existing };
}

/** Modifie le nom affiché du compte connecté (espace visiteur). */
export async function updateProfile(name: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Connexion requise." };

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "Le nom est trop court." };
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { name: trimmed } });
  revalidatePath("/espace-visiteur");
  return { ok: true };
}
