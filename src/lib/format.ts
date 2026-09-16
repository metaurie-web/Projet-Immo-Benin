/* Petites fonctions de mise en forme réutilisées dans toute l'application. */

import type { ListingStatus, VerificationStatus } from "./types";

/** Sépare les milliers par une espace : 90000 -> "90 000". */
export function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Ajoute l'unité : 90000 -> "90 000 FCFA". */
export function fcfa(n: number): string {
  return fmt(n) + " FCFA";
}

/** "chambre" ou "chambres" selon le nombre. */
export function plural(n: number, singular: string, pluralForm = singular + "s"): string {
  return n > 1 ? pluralForm : singular;
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  en_attente: "En validation",
  en_ligne: "En ligne",
  correction_demandee: "Correction demandée",
  refusee: "Refusée",
  expiree: "Expirée",
};

const STATUS_BADGE_CLASS: Record<ListingStatus, string> = {
  en_attente: "tag tag--neutral",
  en_ligne: "tag",
  correction_demandee: "tag tag--warn",
  refusee: "tag tag--warn",
  expiree: "tag tag--neutral",
};

/** Libellé lisible d'un statut d'annonce ("en_attente" -> "En validation"). */
export function statusLabel(status: ListingStatus): string {
  return STATUS_LABELS[status];
}

/** Classe CSS de badge assortie au statut. */
export function statusBadgeClass(status: ListingStatus): string {
  return STATUS_BADGE_CLASS[status];
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  non_verifie: "Identité non vérifiée",
  en_attente: "Vérification en cours",
  verifie: "Identité vérifiée",
  refuse: "Vérification refusée",
};

const VERIFICATION_BADGE_CLASS: Record<VerificationStatus, string> = {
  non_verifie: "tag tag--neutral",
  en_attente: "tag tag--neutral",
  verifie: "tag",
  refuse: "tag tag--warn",
};

/** Libellé lisible du statut de vérification d'identité d'un propriétaire. */
export function verificationLabel(status: VerificationStatus): string {
  return VERIFICATION_LABELS[status];
}

/** Classe CSS de badge assortie au statut de vérification. */
export function verificationBadgeClass(status: VerificationStatus): string {
  return VERIFICATION_BADGE_CLASS[status];
}

/** "il y a 2 h", "il y a 3 jours"… à partir d'une date. */
export function relativeTime(date: Date): string {
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} ${plural(days, "jour")}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `il y a ${weeks} ${plural(weeks, "semaine")}`;
  const months = Math.floor(days / 30);
  return `il y a ${months} ${plural(months, "mois", "mois")}`;
}
