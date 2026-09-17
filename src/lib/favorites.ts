/* Favoris d'un compte (visiteur ou propriétaire — rien ne l'interdit). */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";
import { toListing } from "./data";
import type { Listing } from "./types";

/** Les références en favori d'un compte, pour marquer les cartes/fiches. */
export async function getFavoriteRefs(userId: string): Promise<string[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { listingRef: true },
  });
  return rows.map((r) => r.listingRef);
}

/** Les annonces mises en favori par un compte, les plus récentes d'abord. */
export async function getFavoriteListings(userId: string): Promise<Listing[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { id: "desc" },
    include: { listing: { include: { reviews: true } } },
  });
  return rows.map((r) => toListing(r.listing));
}

/** Marque chaque annonce comme favorite ou non pour la personne connectée
 *  (aucune marque si personne n'est connecté). À appeler côté serveur avant
 *  de passer des annonces à ListingCard / AnnoncesBrowser. */
export async function withFavorites(listings: Listing[]): Promise<Listing[]> {
  const session = await getServerSession(authOptions);
  if (!session) return listings;

  const refs = new Set(await getFavoriteRefs(session.user.id));
  return listings.map((l) => ({ ...l, isFavorite: refs.has(l.ref) }));
}
