"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SubmitVerificationResult = { ok: true } | { ok: false; error: string };

/** Envoie le compte connecté en file de vérification d'identité. */
export async function submitVerification(identityDocUrl: string): Promise<SubmitVerificationResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/verification-identite");

  if (!identityDocUrl) {
    return { ok: false, error: "Joins d'abord ta pièce d'identité." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      identityDocUrl,
      verificationStatus: "en_attente",
      verificationNote: null,
      verifiedAt: null,
    },
  });

  return { ok: true };
}
