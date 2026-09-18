"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendVisitRequestEmail } from "@/lib/mail";
import { verifyKkiapayTransaction } from "@/lib/kkiapay";
import { VISIT_FEE_FCFA } from "@/lib/payments";

const schema = z.object({
  name: z.string().trim().min(2, "Indique ton nom et prénom."),
  phone: z.string().trim().min(8, "Numéro de téléphone invalide."),
  message: z.string().trim().max(500).optional(),
  slotLabel: z.string().trim().min(1, "Choisis un créneau."),
  // Transaction KKiaPay du paiement des 200 FCFA, déjà effectué côté
  // client (widget) avant l'appel à cette action — voir VisiteForm.tsx.
  transactionId: z.string().trim().min(1, "Paiement requis."),
});

export type SubmitVisitInput = z.infer<typeof schema>;
export type SubmitVisitResult = { ok: true } | { ok: false; error: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Dépose une demande de visite sur une annonce PUBLIÉE. Réservé aux
 *  comptes connectés — c'est ce qui permet de retrouver ses demandes dans
 *  /espace-visiteur et d'éviter les demandes anonymes non vérifiables. */
export async function submitVisitRequest(
  listingRef: string,
  input: SubmitVisitInput,
): Promise<SubmitVisitResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/connexion?callbackUrl=/annonces/${listingRef}/visite`);

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const v = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { ref: listingRef, status: "en_ligne" },
    select: {
      title: true,
      ownerAccount: { select: { email: true } },
    },
  });
  if (!listing) {
    return { ok: false, error: "Cette annonce n'est plus disponible." };
  }

  // Une transaction déjà utilisée pour une autre demande ne peut pas servir
  // deux fois (contrainte unique en base, vérifiée ici pour un message
  // clair plutôt qu'une erreur Prisma brute).
  const alreadyUsed = await prisma.visitRequest.findUnique({
    where: { transactionId: v.transactionId },
    select: { id: true },
  });
  if (alreadyUsed) {
    return { ok: false, error: "Ce paiement a déjà été utilisé pour une autre demande." };
  }

  try {
    await verifyKkiapayTransaction(v.transactionId, VISIT_FEE_FCFA);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Paiement non confirmé." };
  }

  await prisma.visitRequest.create({
    data: {
      listingRef,
      slotLabel: v.slotLabel,
      name: v.name,
      phone: v.phone,
      message: v.message || null,
      requesterId: session.user.id,
      transactionId: v.transactionId,
    },
  });

  revalidatePath("/espace-proprietaire");

  // Les annonces de démonstration n'ont pas de compte propriétaire réel :
  // rien à notifier dans ce cas, la demande reste visible nulle part côté
  // propriétaire (comportement attendu, pas une erreur).
  if (listing.ownerAccount?.email) {
    await sendVisitRequestEmail({
      to: listing.ownerAccount.email,
      listingTitle: listing.title,
      slotLabel: v.slotLabel,
      visitorName: v.name,
      visitorPhone: v.phone,
      message: v.message,
      dashboardUrl: `${siteUrl}/espace-proprietaire`,
    });
  }

  return { ok: true };
}
