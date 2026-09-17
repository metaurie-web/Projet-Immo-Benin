import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Adresse email vérifiée",
};

type Search = { next?: string };

/* Page d'atterrissage du lien envoyé à l'inscription (voir SignUpForm.tsx).
   On n'y arrive qu'après un clic réussi sur ce lien : next-auth a déjà créé
   la session à ce moment-là (callback-handler.js du cœur de next-auth pose
   emailVerified sur le compte pour CHAQUE lien "email" validé, connexion
   comme inscription — rien à revérifier ici, la page elle-même EST la
   preuve que l'adresse est confirmée). Un lien expiré, déjà utilisé ou
   invalide n'atterrit jamais ici : next-auth redirige vers /connexion avant
   (voir pages.error dans src/lib/auth.ts, géré par SignInForm.tsx). */
export default async function InscriptionBienvenuePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion");

  const { next } = await searchParams;

  return (
    <section className="wrap section" style={{ maxWidth: 480 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Mon compte
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 18 }}>
        Adresse email vérifiée
      </h1>
      <p className="prose" style={{ maxWidth: "none", marginBottom: 28 }}>
        {session.user.name ? `Merci ${session.user.name}, ton` : "Ton"} adresse email est
        confirmée et ton espace est maintenant activé.
      </p>
      <Link className="btn" href={next || "/mon-espace"}>
        Accéder à mon espace
      </Link>
    </section>
  );
}
