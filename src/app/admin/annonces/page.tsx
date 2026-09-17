import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllListingsForAdmin } from "@/lib/data";
import { fcfa, statusBadgeClass, statusLabel } from "@/lib/format";
import AdminNav from "@/components/AdminNav";
import AdminListingActions from "@/components/AdminListingActions";

export const metadata: Metadata = { title: "Annonces · Administration" };

export const dynamic = "force-dynamic";

export default async function AdminAnnoncesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin/annonces");
  if (session.user.role !== "admin") redirect("/mon-espace");

  const listings = await getAllListingsForAdmin();

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        Toutes les annonces
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        {listings.length} annonce{listings.length > 1 ? "s" : ""}, tous statuts confondus. Ici tu
        peux changer le statut de n&apos;importe laquelle, la modifier ou la supprimer — pas
        seulement celles en attente.
      </p>

      <AdminNav active="/admin/annonces" />

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bien</th>
              <th>Propriétaire</th>
              <th>Loyer</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.ref}>
                <td>
                  <span className="data-table__primary">{l.title}</span>
                  <span className="data-table__sub">
                    {l.quartier}, {l.city} · réf. {l.ref}
                  </span>
                </td>
                <td>{l.owner}</td>
                <td>{fcfa(l.price)}</td>
                <td>
                  <span className={statusBadgeClass(l.status)}>{statusLabel(l.status)}</span>
                </td>
                <td>
                  <AdminListingActions listingRef={l.ref} currentStatus={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
