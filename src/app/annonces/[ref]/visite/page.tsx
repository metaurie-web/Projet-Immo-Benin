import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VisiteForm from "@/components/VisiteForm";
import { getListing } from "@/lib/data";

type Params = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ref } = await params;
  const l = await getListing(ref);
  return {
    title: l ? `Visite — ${l.title}` : "Prendre rendez-vous",
    description:
      "Choisissez un créneau proposé par le propriétaire et laissez vos coordonnées. " +
      "Aucune somme n'est à verser avant la visite.",
  };
}

export default async function VisitePage({ params }: Params) {
  const { ref } = await params;
  const l = await getListing(ref);
  if (!l) notFound();

  return <VisiteForm listing={l} />;
}
