import Image from "next/image";

/* Affiche une "photo" d'annonce : une vraie image si `src` est une URL
   (photo réellement envoyée sur Vercel Blob), sinon la vignette de
   démonstration habituelle avec le libellé comme légende.
   Un seul endroit à changer le jour où toutes les annonces ont de vraies
   photos. */

const isUrl = (s: string) => /^https?:\/\//.test(s);

export default function ListingPhoto({
  src,
  className = "",
  sizes = "300px",
  caption,
}: {
  src: string;
  className?: string;
  sizes?: string;
  /** Texte affiché à la place du libellé, seulement tant qu'il n'y a pas de vraie photo. */
  caption?: string;
}) {
  if (isUrl(src)) {
    return (
      <div className={`photo photo--filled ${className}`}>
        <Image src={src} alt="" fill sizes={sizes} style={{ objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div className={`photo ${className}`}>
      <span>{caption ?? src}</span>
    </div>
  );
}
