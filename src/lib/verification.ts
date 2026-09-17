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

/** Change le statut de vérification d'un compte (utilisé par l'admin).
 *
 *  N'agit que si le compte est encore "en_attente" (vérification atomique
 *  côté base, via `updateMany` + son compte de lignes touchées) : un
 *  double clic ou un second clic sur une page restée ouverte ne retraite
 *  donc jamais la même demande deux fois. Renvoie `true` si un compte a
 *  bien été mis à jour, `false` si la demande avait déjà été traitée. */
export async function setVerificationStatus(
  userId: string,
  status: VerificationStatus,
  note?: string,
): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId, verificationStatus: "en_attente" },
    data: {
      verificationStatus: status,
      verificationNote: note ?? null,
      verifiedAt: status === "verifie" ? new Date() : null,
    },
  });
  return result.count > 0;
}
