import Link from "next/link";
import type { Listing } from "@/lib/types";
import { fcfa, plural } from "@/lib/format";
import ListingPhoto from "@/components/ListingPhoto";
import FavoriteButton from "@/components/FavoriteButton";

export default function ListingCard({ listing }: { listing: Listing }) {
  const l = listing;
  return (
    <article className="listing-card">
      <div className="listing-card__media">
        <ListingPhoto src={l.photos[0]} sizes="(min-width: 900px) 285px, 45vw" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <FavoriteButton
              listingRef={l.ref}
              initialFavorited={l.isFavorite ?? false}
              compact
            />
            <Link className="link-underline" href={`/annonces/${l.ref}`}>
              Détails
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
