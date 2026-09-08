import Link from "next/link";
import type { Listing } from "@/lib/types";
import { fcfa, plural } from "@/lib/format";

export default function ListingCard({ listing }: { listing: Listing }) {
  const l = listing;
  return (
    <article className="listing-card">
      <div className="listing-card__media">
        <div className="photo">
          <span>{l.photos[0]}</span>
        </div>
      </div>
      <div className="listing-card__body">
        <p className="listing-card__area">
          {l.quartier}, {l.city}
        </p>
        <h3 className="listing-card__title">{l.title}</h3>
        <p className="listing-card__price num">
          {fcfa(l.price)} <small>/ mois</small>
        </p>
        <p className="listing-card__specs">
          {l.rooms} {plural(l.rooms, "chambre")} · {l.furnished ? "meublé" : "non meublé"} ·
          compteur {l.meter} · {l.water.toLowerCase()}
        </p>
        <div className="listing-card__foot">
          <span className="tag">Propriétaire vérifié</span>
          <Link className="link-underline" href={`/annonces/${l.ref}`}>
            Détails
          </Link>
        </div>
      </div>
    </article>
  );
}
