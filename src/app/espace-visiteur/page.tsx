import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getFavoriteListings } from "@/lib/favorites";
import ListingCard from "@/components/ListingCard";
import ProfileForm from "@/components/ProfileForm";

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Ton profil et les biens que tu as mis de côté.",
};

// Les favoris peuvent changer à tout moment : toujours relire la base.
export const dynamic = "force-dynamic";

export default async function EspaceVisiteurPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/espace-visiteur");

  // L'admin a son propre espace : pas de double affichage possible.
  if (session.user.role === "admin") redirect("/admin");

  const favorites = await getFavoriteListings(session.user.id);
  const favoritesWithFlag = favorites.map((l) => ({ ...l, isFavorite: true }));

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Mon espace
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 24 }}>
        Bonjour, {session.user.name || session.user.email}
      </h1>

      {session.user.role === "visiteur" && (
        <p className="notice" style={{ marginBottom: 30, maxWidth: "60ch" }}>
          Tu cherches à publier un bien plutôt qu'à en louer un ?{" "}
          <Link href="/publier" className="link-underline">
            Commence par ici
          </Link>{" "}
          — après vérification de ton identité (une seule fois), tu retrouveras un espace
          propriétaire dédié.
        </p>
      )}

      <h2
        className="h-serif h-serif--26"
        style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 10, marginBottom: 20 }}
      >
        Mon profil
      </h2>
      <ProfileForm initialName={session.user.name || ""} />

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 22px", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Mes favoris
      </h2>
      {favoritesWithFlag.length === 0 ? (
        <p className="muted" style={{ padding: "0 0 24px" }}>
          Aucun favori pour l&apos;instant.{" "}
          <Link href="/annonces" className="link-underline">
            Parcourir les annonces
          </Link>
        </p>
      ) : (
        <div className="card-grid">
          {favoritesWithFlag.map((l) => (
            <ListingCard key={l.ref} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
