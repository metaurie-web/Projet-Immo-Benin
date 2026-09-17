"use server";

import { prisma } from "@/lib/db";

export type CheckAccountResult = { ok: true } | { ok: false; error: string };

/** Vérifie qu'un compte existe avant d'envoyer un lien de connexion.
 *
 *  Sans ce contrôle, next-auth créerait silencieusement un nouveau compte
 *  pour n'importe quel email tapé ici — ce qui viderait /inscription de son
 *  sens et empêcherait de distinguer "compte inexistant" des autres cas. */
export async function ensureAccountExists(email: string): Promise<CheckAccountResult> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    return { ok: false, error: "Aucun compte n'est associé à cet email." };
  }
  return { ok: true };
}
