import type { Metadata } from "next";
import { Suspense } from "react";
import AnnoncesBrowser from "@/components/AnnoncesBrowser";
import { getAllListings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Annonces à louer",
  description:
    "Tous les logements à louer publiés par leur propriétaire à Cotonou, Abomey-Calavi, " +
    "Porto-Novo et Ouidah. Filtrez par quartier, budget, type de bien et équipements.",
};

export default function AnnoncesPage() {
  const listings = getAllListings();

  return (
    <section className="wrap section">
      {/* useSearchParams() dans <AnnoncesBrowser> impose une frontière <Suspense>. */}
      <Suspense fallback={<p className="muted">Chargement des annonces…</p>}>
        <AnnoncesBrowser listings={listings} />
      </Suspense>
    </section>
  );
}
