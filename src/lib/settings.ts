/* Réglages généraux du site — une seule ligne en base (id "default").
   Pour l'instant : le montant de la commission de publication. D'autres
   réglages pourront s'ajouter ici au même format plus tard. */

import { prisma } from "./db";

const DEFAULT_COMMISSION = 5000; // FCFA

/** Lit les réglages, en les créant s'ils n'existent pas encore. */
export async function getSettings(): Promise<{ commissionAmount: number }> {
  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", commissionAmount: DEFAULT_COMMISSION },
  });
  return { commissionAmount: row.commissionAmount };
}

export async function setCommission(amount: number): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { commissionAmount: amount },
    create: { id: "default", commissionAmount: amount },
  });
}
