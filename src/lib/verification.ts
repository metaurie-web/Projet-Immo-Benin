/* Vérification d'identité d'un compte propriétaire.

   Distincte de src/lib/data.ts (qui s'occupe des ANNONCES) : ici on lit et
   on modifie le compte (`User`), pas les biens qu'il publie. */

import { prisma } from "./db";
import type { VerificationStatus } from "./types";

export type PendingVerification = {
  id: string;
  email: string;
  name: string | null;
  identityDocUrl: string | null;
  createdAt: Date;
};

/** Comptes en attente de vérification, les plus anciens d'abord. */
export async function getPendingVerifications(): Promise<PendingVerification[]> {
  return prisma.user.findMany({
    where: { verificationStatus: "en_attente" },
    select: { id: true, email: true, name: true, identityDocUrl: true, createdAt: true },
    orderBy: { id: "asc" },
  });
}

/** Change le statut de vérification d'un compte (utilisé par l'admin). */
export async function setVerificationStatus(
  userId: string,
  status: VerificationStatus,
  note?: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: status,
      verificationNote: note ?? null,
      verifiedAt: status === "verifie" ? new Date() : null,
    },
  });
}
