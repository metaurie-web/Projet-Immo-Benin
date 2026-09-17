"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toggleFavorite } from "@/app/espace-visiteur/actions";

/* Bouton « ajouter/retirer des favoris », utilisable sur une carte
   d'annonce ou sa fiche. Visiteur non connecté : redirige vers /connexion
   au lieu d'appeler l'action (pas de session, rien à enregistrer). */
export default function FavoriteButton({
  listingRef,
  initialFavorited,
  compact = false,
}: {
  listingRef: string;
  initialFavorited: boolean;
  compact?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (status !== "authenticated") {
      router.push(`/connexion?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    // Optimiste : on inverse tout de suite, on corrige si le serveur refuse.
    setFavorited((f) => !f);
    startTransition(async () => {
      const result = await toggleFavorite(listingRef);
      if (!result.ok) {
        setFavorited((f) => !f); // annule l'optimisme
        return;
      }
      setFavorited(result.favorited);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      className={compact ? "link-underline" : "btn btn--sm btn--ghost"}
      title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {favorited ? "★ Favori" : "☆ Favori"}
    </button>
  );
}
