/* Gestion des comptes (visiteurs et propriétaires) côté admin.
   Distinct de src/lib/verification.ts (qui ne traite que la vérification
   d'identité) et de src/lib/data.ts (qui ne traite que les annonces). */

import { prisma } from "./db";
import type { UserRole } from "./types";

export type AccountSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  verificationStatus: string;
  createdAt: Date;
  listingCount: number;
  favoriteCount: number;
};

async function listAccounts(role: UserRole): Promise<AccountSummary[]> {
  const rows = await prisma.user.findMany({
    where: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verificationStatus: true,
      createdAt: true,
      _count: { select: { listings: true, favorites: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role as UserRole,
    verificationStatus: r.verificationStatus,
    createdAt: r.createdAt,
    listingCount: r._count.listings,
    favoriteCount: r._count.favorites,
  }));
}

/** Tous les comptes propriétaires, les plus récents d'abord. */
export function getOwnerAccounts(): Promise<AccountSummary[]> {
  return listAccounts("proprietaire");
}

/** Tous les comptes visiteurs, les plus récents d'abord. */
export function getVisitorAccounts(): Promise<AccountSummary[]> {
  return listAccounts("visiteur");
}

/** Décompte des comptes par rôle, pour le tableau de bord admin. */
export async function getAccountCounts(): Promise<Record<UserRole, number>> {
  const rows = await prisma.user.groupBy({ by: ["role"], _count: true });
  const counts: Record<UserRole, number> = { visiteur: 0, proprietaire: 0, admin: 0 };
  for (const r of rows) counts[r.role as UserRole] = r._count;
  return counts;
}

/** Change le rôle d'un compte (promotion/rétrogradation manuelle par un admin). */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { role } });
}

/** Supprime un compte (sessions et favoris avec lui). Ses annonces restent
 *  en ligne mais deviennent orphelines (ownerId à null) — on ne supprime
 *  jamais une annonce publique en supprimant juste un compte. */
export async function deleteAccount(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}
