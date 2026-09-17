import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignUpForm from "@/components/SignUpForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Crée ton compte Mon Appart pour rechercher un logement, le mettre en favori, ou publier une annonce.",
};

type Search = { callbackUrl?: string; email?: string };

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await getServerSession(authOptions);
  const { callbackUrl, email } = await searchParams;

  // Déjà connecté : inutile de repasser par ici.
  if (session) redirect(callbackUrl || "/mon-espace");

  return (
    <section className="wrap section" style={{ maxWidth: 480 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Mon compte
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 18 }}>
        Créer un compte
      </h1>
      <p className="prose" style={{ maxWidth: "none", marginBottom: 28 }}>
        Indique ton nom et ton email : tu recevras un lien pour activer ton compte, sans mot de
        passe à créer ni à retenir. Tu pourras ensuite chercher un logement, le mettre en
        favori, ou{" "}
        <Link href="/publier" className="link-underline">
          publier une annonce
        </Link>{" "}
        après vérification de ton identité.
      </p>
      <SignUpForm callbackUrl={callbackUrl} initialEmail={email} />
    </section>
  );
}
