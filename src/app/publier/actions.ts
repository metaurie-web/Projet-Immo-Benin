"use server";

/* Action serveur : enregistre une annonce déposée par le formulaire /publier.
   « use server » en haut du fichier : tout ce qu'il exporte tourne côté
   serveur, jamais dans le navigateur — la base de données n'est jamais
   exposée au client. */

import { z } from "zod";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fcfa } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { verifyKkiapayTransaction } from "@/lib/kkiapay";

const publishSchema = z.object({
  name: z.string().trim().min(2, "Indique ton nom et prénom."),
  phone: z.string().trim().min(8, "Numéro de téléphone invalide."),
  city: z.enum(["Cotonou", "Abomey-Calavi", "Porto-Novo", "Ouidah"]),
  quartier: z.string().trim().min(2, "Indique le quartier."),
  title: z.string().trim().min(6, "Le titre est trop court."),
  type: z.enum(["Chambre-salon", "Appartement", "Maison basse", "Villa"]),
  rooms: z.coerce.number().int().min(1).max(10),
  furnished: z.coerce.boolean(),
  meter: z.enum(["individuel", "partagé"]),
  water: z.string().trim().min(2, "Indique la source d'eau."),
  parking: z.coerce.boolean(),
  price: z.coerce.number().int().min(5000, "Loyer trop faible."),
  advance: z.enum(["1 mois", "2 mois", "3 mois", "6 mois"]),
  deposit: z.enum(["1 mois", "2 mois", "3 mois"]),
  landmark: z.string().trim().min(2, "Indique un point de repère."),
  description: z
    .string()
    .trim()
    .min(30, "Décris le logement en quelques phrases (30 caractères minimum)."),
  // Une entrée par emplacement : soit l'URL d'une vraie photo envoyée sur
  // Vercel Blob, soit le libellé de démonstration si l'emplacement est resté vide.
  photos: z.array(z.string().min(1)).length(4),
  // Transaction KKiaPay de la commission de publication, déjà effectué
  // côté client (widget) avant l'appel à cette action — voir PublierWizard.tsx.
  transactionId: z.string().trim().min(1, "Paiement requis."),
});

export type PublishInput = z.infer<typeof publishSchema>;
export type PublishResult = { ok: true; ref: string } | { ok: false; error: string };

/** Trouve la prochaine référence "MA-xxxx" libre. */
async function nextRef(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const n = 1100 + (await prisma.listing.count()) + attempt;
    const ref = `MA-${n}`;
    const taken = await prisma.listing.findUnique({ where: { ref }, select: { ref: true } });
    if (!taken) return ref;
  }
  // Filet de sécurité très improbable à atteindre : un identifiant unique.
  return `MA-${Date.now()}`;
}

export async function publishListing(input: PublishInput): Promise<PublishResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/publier");

  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const v = parsed.data;

  // Une transaction déjà utilisée pour une autre annonce ne peut pas servir
  // deux fois (contrainte unique en base, vérifiée ici pour un message
  // clair plutôt qu'une erreur Prisma brute).
  const alreadyUsed = await prisma.listing.findUnique({
    where: { transactionId: v.transactionId },
    select: { ref: true },
  });
  if (alreadyUsed) {
    return { ok: false, error: "Ce paiement a déjà été utilisé pour une autre annonce." };
  }

  // Le montant attendu est relu ici, pas transmis par le client : la
  // commission a pu changer entre l'affichage du formulaire et ce clic
  // (voir /admin/parametres), la vérité est toujours le réglage courant.
  const { commissionAmount } = await getSettings();
  try {
    await verifyKkiapayTransaction(v.transactionId, commissionAmount);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Paiement non confirmé." };
  }

  const advanceMonths = parseInt(v.advance, 10);
  const depositMonths = parseInt(v.deposit, 10);
  const totalIn = v.price * advanceMonths + v.price * depositMonths;

  const ownerListingsSoFar = await prisma.listing.count({ where: { ownerId: session.user.id } });
  const ref = await nextRef();

  await prisma.listing.create({
    data: {
      ref,
      title: v.title,
      city: v.city,
      quartier: v.quartier,
      type: v.type,
      price: v.price,
      rooms: v.rooms,
      furnished: v.furnished,
      meter: v.meter,
      water: v.water,
      parking: v.parking,
      advance: v.advance,
      deposit: v.deposit,
      landmark: v.landmark,
      description: v.description,
      totalIn,
      featured: false,
      publishedAt: "à l'instant",
      status: "en_attente",
      transactionId: v.transactionId,

      owner: v.name,
      ownerSince: String(new Date().getFullYear()),
      ownerCount: ownerListingsSoFar + 1,
      ownerId: session.user.id,

      // Pas encore d'avis pour une annonce toute neuve.
      rating: "—",
      reviewsCount: 0,

      // Documents réels (pièce d'identité, titre) : étape suivante.
      photos: v.photos,

      costRows: [
        { k: "Loyer mensuel", v: fcfa(v.price) },
        { k: `Avance à la signature (${v.advance})`, v: fcfa(v.price * advanceMonths) },
        { k: `Caution (${v.deposit})`, v: fcfa(v.price * depositMonths) },
        { k: "Frais de démarcheur", v: fcfa(0) },
      ],
    },
  });

  return { ok: true, ref };
}
