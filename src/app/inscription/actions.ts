"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2, "Indique ton nom et prénom."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Indique ton adresse email.")
    .email("Adresse email invalide."),
});

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string; alreadyExists?: boolean };

/** Crée le compte (rôle "visiteur" par défaut). N'envoie pas le lien de
 *  connexion elle-même — c'est SignUpForm qui appelle ensuite signIn("email",
 *  …), le même mécanisme que /connexion, une fois le compte créé. */
export async function registerAccount(input: {
  name: string;
  email: string;
}): Promise<RegisterResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const { name, email } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      alreadyExists: true,
      error: "Un compte existe déjà avec cet email.",
    };
  }

  await prisma.user.create({ data: { name, email } });

  return { ok: true };
}
