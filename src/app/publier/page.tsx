import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PublierWizard from "@/components/PublierWizard";

export const metadata: Metadata = {
  title: "Publier un bien",
  description:
    "Publiez votre logement en trois étapes : informations et photos, vérification de " +
    "votre identité et de votre titre, puis publication. Commission de 5 000 FCFA pour 30 jours.",
};

export default async function PublierPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/publier");

  return <PublierWizard />;
}
