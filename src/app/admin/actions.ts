"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setListingStatus, setPendingListingStatus } from "@/lib/data";
import { setVerificationStatus } from "@/lib/verification";
import { setUserRole, deleteAccount } from "@/lib/users";
import { setCommission } from "@/lib/settings";
import {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendListingApprovedEmail,
  sendListingRejectedEmail,
} from "@/lib/mail";
import type { ListingStatus, UserRole } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export type ModerationResult = { ok: true } | { ok: false; error: string };

/** Vrai seulement si la personne connectée est administratrice. Toute
 *  action de ce fichier repasse par ici : une action serveur est un point
 *  d'entrée public, la vérifier au niveau de la page ne suffit pas. */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

/* ---------------------------------------------------------------------- */
/*  Annonces                                                               */
/* ---------------------------------------------------------------------- */

export type ModerationOutcome = "valid" | "fix" | "reject";

const OUTCOME_TO_STATUS: Record<ModerationOutcome, ListingStatus> = {
  valid: "en_ligne",
  fix: "correction_demandee",
  reject: "refusee",
};

/** Change le statut d'une annonce depuis la file de modération. Pour une
 *  validation ou un refus, envoie ensuite un email au propriétaire (même
 *  infrastructure que la vérification d'identité, voir moderateVerification
 *  plus bas) : un échec d'envoi est journalisé mais ne fait pas échouer la
 *  décision, le statut en base reste la source de vérité. */
export async function moderateListing(
  ref: string,
  outcome: ModerationOutcome,
): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };

  const updated = await setPendingListingStatus(ref, OUTCOME_TO_STATUS[outcome]);
  if (!updated) {
    return { ok: false, error: "Cette annonce a déjà été traitée." };
  }
  revalidateListingPaths();

  if (outcome === "valid" || outcome === "reject") {
    const listing = await prisma.listing.findUnique({
      where: { ref },
      select: { title: true, ownerAccount: { select: { email: true } } },
    });
    if (listing?.ownerAccount?.email) {
      try {
        if (outcome === "valid") {
          await sendListingApprovedEmail({
            to: listing.ownerAccount.email,
            listingTitle: listing.title,
            listingUrl: `${siteUrl}/annonces/${ref}`,
          });
        } else {
          await sendListingRejectedEmail({
            to: listing.ownerAccount.email,
            listingTitle: listing.title,
            dashboardUrl: `${siteUrl}/espace-proprietaire`,
          });
        }
      } catch (err) {
        console.error("Échec de l'envoi de l'email de décision de modération :", err);
      }
    }
  }

  return { ok: true };
}

/** Change le statut d'une annonce depuis /admin/annonces (n'importe quel statut). */
export async function setListingStatusAction(
  ref: string,
  status: ListingStatus,
): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };

  await setListingStatus(ref, status);
  revalidateListingPaths();
  return { ok: true };
}

/** Supprime définitivement une annonce. */
export async function deleteListingAction(ref: string): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };

  await prisma.listing.delete({ where: { ref } });
  revalidateListingPaths();
  revalidatePath("/admin/annonces");
  return { ok: true };
}

export type UpdateListingInput = {
  title: string;
  price: number;
  description: string;
  featured: boolean;
  status: ListingStatus;
};

/** Modifie les champs d'une annonce depuis /admin/annonces/[ref]/modifier. */
export async function updateListingAction(
  ref: string,
  input: UpdateListingInput,
): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };

  if (input.title.trim().length < 6) {
    return { ok: false, error: "Le titre est trop court." };
  }
  if (input.price < 5000) {
    return { ok: false, error: "Loyer trop faible." };
  }
  if (input.description.trim().length < 30) {
    return { ok: false, error: "La description est trop courte." };
  }

  await prisma.listing.update({
    where: { ref },
    data: {
      title: input.title.trim(),
      price: input.price,
      description: input.description.trim(),
      featured: input.featured,
      status: input.status,
    },
  });
  revalidateListingPaths();
  revalidatePath("/admin/annonces");
  return { ok: true };
}

function revalidateListingPaths() {
  revalidatePath("/admin");
  revalidatePath("/annonces");
  revalidatePath("/");
  revalidatePath("/espace-proprietaire");
}

/* ---------------------------------------------------------------------- */
/*  Vérification d'identité                                                */
/* ---------------------------------------------------------------------- */

export type VerificationOutcome = "valid" | "reject";

const REJECT_NOTE =
  "Document illisible ou incomplet — réessaie avec une pièce d'identité nette et à jour.";

/** Valide ou refuse la vérification d'identité d'un compte. Une validation
 *  promeut aussi le compte au rôle "proprietaire" — c'est le seul chemin
 *  normal pour le devenir. Envoie ensuite un email de décision au compte
 *  concerné (réutilise l'infrastructure d'envoi existante, src/lib/mail.ts) :
 *  un échec d'envoi est journalisé mais ne fait pas échouer l'action, le
 *  statut en base reste la source de vérité. */
export async function moderateVerification(
  userId: string,
  outcome: VerificationOutcome,
): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };

  const updated = await setVerificationStatus(
    userId,
    outcome === "valid" ? "verifie" : "refuse",
    outcome === "reject" ? REJECT_NOTE : undefined,
  );
  if (!updated) {
    return { ok: false, error: "Cette demande a déjà été traitée." };
  }

  if (outcome === "valid") {
    await prisma.user.updateMany({
      where: { id: userId, role: "visiteur" },
      data: { role: "proprietaire" },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/proprietaires");
  revalidatePath("/admin/visiteurs");
  revalidatePath("/verification-identite");
  revalidatePath("/publier");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user?.email) {
    try {
      if (outcome === "valid") {
        await sendVerificationApprovedEmail({ to: user.email, connexionUrl: `${siteUrl}/connexion` });
      } else {
        await sendVerificationRejectedEmail({
          to: user.email,
          note: REJECT_NOTE,
          retryUrl: `${siteUrl}/verification-identite`,
        });
      }
    } catch (err) {
      console.error("Échec de l'envoi de l'email de décision de vérification :", err);
    }
  }

  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/*  Comptes (propriétaires et visiteurs)                                   */
/* ---------------------------------------------------------------------- */

/** Change le rôle d'un compte à la main (promotion ou rétrogradation). */
export async function changeUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<ModerationResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Action réservée aux administrateurs." };
  if (userId === session.user.id) {
    return { ok: false, error: "Impossible de changer ton propre rôle depuis ici." };
  }

  await setUserRole(userId, role);
  revalidatePath("/admin/proprietaires");
  revalidatePath("/admin/visiteurs");
  return { ok: true };
}

/** Supprime un compte (propriétaire ou visiteur). */
export async function deleteAccountAction(userId: string): Promise<ModerationResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Action réservée aux administrateurs." };
  if (userId === session.user.id) {
    return { ok: false, error: "Impossible de supprimer ton propre compte depuis ici." };
  }

  await deleteAccount(userId);
  revalidatePath("/admin/proprietaires");
  revalidatePath("/admin/visiteurs");
  revalidatePath("/espace-proprietaire");
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/*  Réglages généraux                                                      */
/* ---------------------------------------------------------------------- */

export async function updateCommissionAction(amount: number): Promise<ModerationResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Action réservée aux administrateurs." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: "Montant invalide." };
  }

  await setCommission(Math.round(amount));
  revalidatePath("/admin/parametres");
  revalidatePath("/publier");
  return { ok: true };
}
