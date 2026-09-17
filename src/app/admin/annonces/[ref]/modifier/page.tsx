import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getListingForAdmin } from "@/lib/data";
import EditListingForm from "@/components/EditListingForm";

type Params = { params: Promise<{ ref: string }> };

export const metadata: Metadata = { title: "Modifier une annonce · Administration" };

export default async function AdminModifierAnnoncePage({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin/annonces");
  if (session.user.role !== "admin") redirect("/mon-espace");

  const { ref } = await params;
  const listing = await getListingForAdmin(ref);
  if (!listing) notFound();

  return (
    <section className="wrap section">
      <Link className="link-back" href="/admin/annonces">
        ← Retour à toutes les annonces
      </Link>
      <p className="eyebrow eyebrow--muted" style={{ marginBottom: 8 }}>
        Réf. {listing.ref}
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 30 }}>
        Modifier l&apos;annonce
      </h1>
      <EditListingForm listing={listing} />
    </section>
  );
}
