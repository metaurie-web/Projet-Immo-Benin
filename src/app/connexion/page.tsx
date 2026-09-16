import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous par lien magique : indiquez votre email, nous vous envoyons un lien de connexion. Aucun mot de passe à retenir.",
};

type Search = { callbackUrl?: string; error?: string };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl, error } = await searchParams;

  // Déjà connecté : inutile de repasser par ici.
  if (session) redirect(callbackUrl || "/espace-proprietaire");

  return (
    <section className="wrap section" style={{ maxWidth: 480 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Espace propriétaire
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 18 }}>
        Connexion par lien magique
      </h1>
      <p className="prose" style={{ maxWidth: "none", marginBottom: 28 }}>
        Indiquez votre email : nous vous envoyons un lien de connexion. Cliquez dessus, c'est tout
        — pas de mot de passe à créer ni à retenir.
      </p>
      <SignInForm callbackUrl={callbackUrl} error={error} />
    </section>
  );
}
