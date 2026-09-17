import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import PublierWizard from "@/components/PublierWizard";

export const metadata: Metadata = {
  title: "Publier un bien",
  description: "Publiez votre logement en deux étapes : informations et photos, puis publication.",
};

export default async function PublierPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/publier");

  // L'identité se vérifie une seule fois, avant la toute première annonce —
  // pas à chaque publication (voir /verification-identite).
  if (session.user.verificationStatus !== "verifie") {
    redirect("/verification-identite?callbackUrl=/publier");
  }

  const { commissionAmount } = await getSettings();

  return <PublierWizard commission={commissionAmount} />;
}
