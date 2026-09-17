"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addSlot, deleteSlot } from "@/lib/visits";
import { sendVisitStatusEmail } from "@/lib/mail";

export type ActionResult = { ok: true } | { ok: false; error: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Vrai seulement si `listingRef` appartient bien au compte connecté —
 *  une action serveur est un point d'entrée public, il ne suffit pas
 *  qu'un propriétaire soit connecté : il doit l'être pour CE bien précis. */
async function requireOwnListing(listingRef: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const listing = await prisma.listing.findUnique({
    where: { ref: listingRef },
    select: { ownerId: true },
  });
  if (!listing || listing.ownerId !== session.user.id) return null;
  return session;
}

/* ---------------------------------------------------------------------- */
/*  Créneaux                                                               */
/* ---------------------------------------------------------------------- */

export async function addVisitSlotAction(
  listingRef: string,
  slot: { day: string; date: string; time: string },
): Promise<ActionResult> {
  if (!(await requireOwnListing(listingRef))) {
    return { ok: false, error: "Cette annonce ne t'appartient pas." };
  }
  if (!slot.day.trim() || !slot.date.trim() || !slot.time.trim()) {
    return { ok: false, error: "Remplis les trois champs du créneau." };
  }

  await addSlot(listingRef, {
    day: slot.day.trim(),
    date: slot.date.trim(),
    time: slot.time.trim(),
  });
  revalidatePath("/espace-proprietaire");
  return { ok: true };
}

export async function removeVisitSlotAction(
  listingRef: string,
  slotId: number,
): Promise<ActionResult> {
  if (!(await requireOwnListing(listingRef))) {
    return { ok: false, error: "Cette annonce ne t'appartient pas." };
  }

  await deleteSlot(slotId);
  revalidatePath("/espace-proprietaire");
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/*  Demandes de visite                                                     */
/* ---------------------------------------------------------------------- */

async function setVisitRequestStatus(
  requestId: number,
  status: "confirmee" | "refusee",
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Connexion requise." };

  const request = await prisma.visitRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: { select: { ref: true, title: true, ownerId: true } },
      requester: { select: { email: true } },
    },
  });
  if (!request || request.listing.ownerId !== session.user.id) {
    return { ok: false, error: "Cette demande ne te concerne pas." };
  }

  await prisma.visitRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath("/espace-proprietaire");
  revalidatePath("/espace-visiteur");

  if (request.requester?.email) {
    await sendVisitStatusEmail({
      to: request.requester.email,
      listingTitle: request.listing.title,
      slotLabel: request.slotLabel,
      confirmed: status === "confirmee",
      listingUrl: `${siteUrl}/annonces/${request.listing.ref}`,
    });
  }

  return { ok: true };
}

export async function confirmVisitRequestAction(requestId: number): Promise<ActionResult> {
  return setVisitRequestStatus(requestId, "confirmee");
}

export async function rejectVisitRequestAction(requestId: number): Promise<ActionResult> {
  return setVisitRequestStatus(requestId, "refusee");
}
