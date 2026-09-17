import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import VisiteForm from "@/components/VisiteForm";
import { getListing } from "@/lib/data";
import { getSlotsForListing } from "@/lib/visits";

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

// Les créneaux peuvent changer à tout moment : toujours relire la base.
export const dynamic = "force-dynamic";

export default async function VisitePage({ params }: Params) {
  const { ref } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/connexion?callbackUrl=/annonces/${ref}/visite`);

  const l = await getListing(ref);
  if (!l) notFound();

  const slots = await getSlotsForListing(ref);

  return (
    <VisiteForm listing={l} slots={slots} initialName={session.user.name || ""} />
  );
}
