import type { Metadata } from "next";
import PublierWizard from "@/components/PublierWizard";

export const metadata: Metadata = {
  title: "Publier un bien",
  description:
    "Publiez votre logement en trois étapes : informations et photos, vérification de " +
    "votre identité et de votre titre, puis paiement de la commission de 5 000 FCFA pour 30 jours.",
};

export default function PublierPage() {
  return <PublierWizard />;
}
