/* =========================================================================
   Accès aux données.

   Les ANNONCES viennent maintenant de la base de données (via Prisma).
   Les fonctions getAllListings / getFeaturedListings / getListing sont
   devenues « async » : elles renvoient une promesse, il faut donc les
   « await » dans les pages.

   Le reste (villes, FAQ, témoignages, créneaux) est encore écrit en dur
   ici — ce sont des contenus éditoriaux, pas des données qui bougent.

   Montants en francs CFA (FCFA).
   ========================================================================= */

import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type {
  City,
  CostRow,
  FaqItem,
  Listing,
  ListingStatus,
  MeterKind,
  PropertyType,
  Testimonial,
} from "./types";

export const BRAND = "Mon Appart";
// Le montant de la commission est un réglage en base, éditable par un
// admin — voir src/lib/settings.ts et /admin/parametres.

/* ------------------------------------------------------------------ */
/*  Contenus éditoriaux (statiques)                                     */
/* ------------------------------------------------------------------ */

export const CITIES: City[] = [
  { name: "Cotonou", count: 86, areas: "Fidjrossè · Cadjèhoun · Akpakpa · Sainte-Rita · Godomey · Gbédjromédé" },
  { name: "Abomey-Calavi", count: 61, areas: "Tankpè · Zogbadjè · Womey · Akassato · Glo-Djigbé" },
  { name: "Porto-Novo", count: 42, areas: "Ouando · Djègan-Daho · Attakè · Louho" },
  { name: "Ouidah", count: 25, areas: "Centre · Pahou · Avlékété · Savi" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "« Ce qui m'a décidé, c'est la ligne “compteur SBEE individuel” écrite sur l'annonce. Avant, je découvrais ça après avoir versé l'avance. »",
    who: "Moïse T.",
    role: "Locataire à Tankpè, Abomey-Calavi",
  },
  {
    text: "« J'ai loué mon appartement en onze jours sans qu'un démarcheur y passe. Les visiteurs arrivaient en connaissant déjà le loyer et l'avance. »",
    who: "M. Adjovi Kossi",
    role: "Propriétaire à Fidjrossè, Cotonou",
  },
  {
    text: "« Cinq mille francs pour trente jours, c'est moins que le mois de commission que je perdais à chaque nouveau locataire. »",
    who: "Mme Tossou Alice",
    role: "Propriétaire à Sainte-Rita, Cotonou",
  },
];

export const FAQ: FaqItem[] = [
  {
    q: "Faut-il payer pour chercher un logement ?",
    a: "Non. La recherche, les demandes de visite et le contact avec le propriétaire sont gratuits pour les locataires. Seuls les propriétaires paient la publication de leur annonce.",
  },
  {
    q: "Comment savez-vous que le propriétaire est bien le propriétaire ?",
    a: "Avant toute mise en ligne, nous contrôlons une pièce d'identité et un titre de propriété : attestation de recasement, convention de vente ou titre foncier. Une annonce dont les documents ne concordent pas n'est pas publiée.",
  },
  {
    q: "Et si l'on me demande de l'argent pour visiter ?",
    a: "Aucune somme n'est due avant la visite, ni pour l'obtenir. Signalez-nous la demande : le compte concerné est suspendu le temps du contrôle.",
  },
  {
    q: "Le bail se signe-t-il sur le site ?",
    a: "Non. Le site vous met en relation et fixe le rendez-vous. Le bail se conclut entre vous et le propriétaire, comme d'habitude.",
  },
  {
    q: "Combien de temps une annonce reste-t-elle en ligne ?",
    a: "Trente jours par publication. Le propriétaire la renouvelle tant que le bien est libre, et elle disparaît d'elle-même dès qu'il ne fait rien.",
  },
  {
    q: "Quelles villes sont couvertes ?",
    a: "Cotonou, Abomey-Calavi, Porto-Novo et Ouidah pour le lancement. Les villes suivantes seront ouvertes selon les demandes que nous recevons.",
  },
];

/* ------------------------------------------------------------------ */
/*  Annonces (base de données)                                          */
/* ------------------------------------------------------------------ */

// La ligne telle que Prisma la renvoie, avis inclus.
type ListingRow = Prisma.ListingGetPayload<{ include: { reviews: true } }>;

// Traduit une ligne de base de données vers la forme utilisée par les pages.
export function toListing(row: ListingRow): Listing {
  return {
    ref: row.ref,
    title: row.title,
    city: row.city,
    quartier: row.quartier,
    type: row.type as PropertyType,
    price: row.price,
    rooms: row.rooms,
    furnished: row.furnished,
    meter: row.meter as MeterKind,
    water: row.water,
    parking: row.parking,
    advance: row.advance,
    deposit: row.deposit,
    owner: row.owner,
    ownerSince: row.ownerSince,
    ownerCount: row.ownerCount,
    ownerId: row.ownerId,
    rating: row.rating,
    reviews: row.reviewsCount,
    publishedAt: row.publishedAt,
    featured: row.featured,
    status: row.status as ListingStatus,
    landmark: row.landmark,
    description: row.description,
    photos: row.photos as unknown as string[],
    costRows: row.costRows as unknown as CostRow[],
    totalIn: row.totalIn,
    reviewList: row.reviews.map((r) => ({
      who: r.who,
      when: r.when,
      stars: r.stars,
      text: r.text,
    })),
    createdAt: row.createdAt,
  };
}

/** Toutes les annonces PUBLIÉES (en ligne), de la plus récente à la plus ancienne. */
export async function getAllListings(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: "en_ligne" },
    include: { reviews: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toListing);
}

/** Les annonces mises en avant sur la page d'accueil (forcément en ligne). */
export async function getFeaturedListings(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { featured: true, status: "en_ligne" },
    include: { reviews: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toListing);
}

/** Une annonce PUBLIÉE par sa référence (ex. "MA-1042"), ou null.
 *  Une annonce en attente, refusée ou expirée n'est pas trouvable ici :
 *  c'est ce qui la rend invisible du grand public tant qu'elle n'est pas validée. */
export async function getListing(ref: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({
    where: { ref, status: "en_ligne" },
    include: { reviews: true },
  });
  return row ? toListing(row) : null;
}

/** Toutes les annonces d'un propriétaire connecté, quel que soit leur statut. */
export async function getListingsByOwner(ownerId: string): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { ownerId },
    include: { reviews: true },
    orderBy: { id: "desc" },
  });
  return rows.map(toListing);
}

/** File de modération : les annonces en attente, les plus anciennes d'abord. */
export async function getPendingListings(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { status: "en_attente" },
    include: { reviews: true },
    orderBy: { id: "asc" },
  });
  return rows.map(toListing);
}

/** TOUTES les annonces, quel que soit leur statut — réservé à /admin/annonces. */
export async function getAllListingsForAdmin(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    include: { reviews: true },
    orderBy: { id: "desc" },
  });
  return rows.map(toListing);
}

/** Une annonce par référence, quel que soit son statut — réservé à l'admin. */
export async function getListingForAdmin(ref: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({
    where: { ref },
    include: { reviews: true },
  });
  return row ? toListing(row) : null;
}

/** Décompte des annonces par statut, pour les tableaux de bord. */
export async function getListingStatusCounts(): Promise<Record<ListingStatus, number>> {
  const rows = await prisma.listing.groupBy({ by: ["status"], _count: true });
  const counts: Record<ListingStatus, number> = {
    en_attente: 0,
    en_ligne: 0,
    correction_demandee: 0,
    refusee: 0,
    expiree: 0,
  };
  for (const r of rows) counts[r.status as ListingStatus] = r._count;
  return counts;
}

/** Fait passer une annonce à un nouveau statut (utilisé par la modération admin). */
export async function setListingStatus(ref: string, status: ListingStatus): Promise<void> {
  await prisma.listing.update({ where: { ref }, data: { status } });
}
