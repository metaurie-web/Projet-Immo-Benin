import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import VerificationForm from "@/components/VerificationForm";

export const metadata: Metadata = {
  title: "Vérification d'identité",
  description:
    "Vérifie ton identité une seule fois pour pouvoir publier des annonces sur Mon Appart.",
};

// Toujours relire la base : le statut peut changer (validé, refusé…).
export const dynamic = "force-dynamic";

export default async function VerificationIdentitePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/verification-identite");

  const { callbackUrl } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { verificationStatus: true, verificationNote: true },
  });
  const status = user?.verificationStatus ?? "non_verifie";

  return (
    <section className="wrap section" style={{ maxWidth: 560 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Mon compte
      </p>
      <h1
        className="display"
        style={{ fontSize: "clamp(30px, 3.6vw, 46px)", marginBottom: 18 }}
      >
        Vérification d&apos;identité
      </h1>

      {status === "verifie" && (
        <>
          <p className="notice" style={{ marginBottom: 24 }}>
            Ton identité est vérifiée. Tu peux publier des annonces sans repasser par cette
            étape.
          </p>
          <Link className="btn" href={callbackUrl || "/publier"}>
            Publier un bien
          </Link>
        </>
      )}

      {status === "en_attente" && (
        <p className="notice">
          Ta pièce d&apos;identité a bien été reçue. Un administrateur la contrôle avant de te
          laisser publier — ça ne prend généralement pas longtemps.
        </p>
      )}

      {(status === "non_verifie" || status === "refuse") && (
        <>
          <p className="prose" style={{ maxWidth: "none", marginBottom: 24 }}>
            Avant de publier ta première annonce, nous devons vérifier ton identité — une seule
            fois. Envoie une pièce d&apos;identité lisible ; nous la contrôlons, puis tu peux
            publier autant de biens que tu veux sans repasser par là.
          </p>
          {status === "refuse" && user?.verificationNote && (
            <p
              className="notice"
              style={{ marginBottom: 20, borderColor: "#c0392b", color: "#c0392b" }}
            >
              Vérification refusée : {user.verificationNote}
            </p>
          )}
          <VerificationForm />
        </>
      )}
    </section>
  );
}
