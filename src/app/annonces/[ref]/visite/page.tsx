import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VisiteForm from "@/components/VisiteForm";
import { LISTINGS, getListing } from "@/lib/data";

type Params = { params: Promise<{ ref: string }> };

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ ref: l.ref }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ref } = await params;
  const l = getListing(ref);
  return {
    title: l ? `Visite — ${l.title}` : "Prendre rendez-vous",
    description:
      "Choisissez un créneau proposé par le propriétaire et laissez vos coordonnées. " +
      "Aucune somme n'est à verser avant la visite.",
  };
}

export default async function VisitePage({ params }: Params) {
  const { ref } = await params;
  const l = getListing(ref);
  if (!l) notFound();

  return <VisiteForm listing={l} />;
}
