/* Petites fonctions de mise en forme réutilisées dans toute l'application. */

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
