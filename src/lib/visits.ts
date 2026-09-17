/* Créneaux de visite et demandes — propres à une annonce (VisitSlot) ou à
   un compte connecté (VisitRequest.requesterId). Distinct de data.ts
   (annonces) et verification.ts (identité). */

import { prisma } from "./db";

export type Slot = { id: number; day: string; date: string; time: string };

/** Créneaux proposés pour UNE annonce, dans l'ordre où le propriétaire les a ajoutés. */
export async function getSlotsForListing(listingRef: string): Promise<Slot[]> {
  return prisma.visitSlot.findMany({
    where: { listingRef },
    select: { id: true, day: true, date: true, time: true },
    orderBy: { id: "asc" },
  });
}

export async function addSlot(
  listingRef: string,
  slot: { day: string; date: string; time: string },
): Promise<void> {
  await prisma.visitSlot.create({ data: { listingRef, ...slot } });
}

export async function deleteSlot(slotId: number): Promise<void> {
  await prisma.visitSlot.delete({ where: { id: slotId } });
}

export type VisitRequestRow = {
  id: number;
  listingRef: string;
  listingTitle: string;
  slotLabel: string;
  name: string;
  phone: string;
  message: string | null;
  status: string;
  createdAt: Date;
};

/** Toutes les demandes reçues sur les annonces d'un propriétaire, les plus récentes d'abord. */
export async function getVisitRequestsForOwner(ownerId: string): Promise<VisitRequestRow[]> {
  const rows = await prisma.visitRequest.findMany({
    where: { listing: { ownerId } },
    include: { listing: { select: { title: true } } },
    orderBy: { id: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    listingRef: r.listingRef,
    listingTitle: r.listing.title,
    slotLabel: r.slotLabel,
    name: r.name,
    phone: r.phone,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

/** Les demandes déposées par un compte visiteur, les plus récentes d'abord. */
export async function getVisitRequestsForVisitor(userId: string): Promise<VisitRequestRow[]> {
  const rows = await prisma.visitRequest.findMany({
    where: { requesterId: userId },
    include: { listing: { select: { title: true } } },
    orderBy: { id: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    listingRef: r.listingRef,
    listingTitle: r.listing.title,
    slotLabel: r.slotLabel,
    name: r.name,
    phone: r.phone,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }));
}
