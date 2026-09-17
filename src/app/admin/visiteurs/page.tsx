import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getVisitorAccounts } from "@/lib/users";
import AdminNav from "@/components/AdminNav";
import AccountActions from "@/components/AccountActions";

export const metadata: Metadata = { title: "Visiteurs · Administration" };

export const dynamic = "force-dynamic";

export default async function AdminVisiteursPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin/visiteurs");
  if (session.user.role !== "admin") redirect("/mon-espace");

  const visitors = await getVisitorAccounts();

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        Comptes visiteurs
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        {visitors.length} compte{visitors.length > 1 ? "s" : ""} avec le rôle visiteur.
      </p>

      <AdminNav active="/admin/visiteurs" />

      {visitors.length === 0 ? (
        <p className="muted">Aucun compte visiteur pour le moment.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Compte</th>
                <th>Favoris</th>
                <th>Membre depuis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="data-table__primary">{v.name || v.email}</span>
                    {v.name && <span className="data-table__sub">{v.email}</span>}
                  </td>
                  <td>{v.favoriteCount}</td>
                  <td>{v.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>
                    <AccountActions
                      userId={v.id}
                      targetRole="proprietaire"
                      targetLabel="Promouvoir propriétaire"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
