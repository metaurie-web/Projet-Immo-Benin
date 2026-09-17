import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getOwnerAccounts } from "@/lib/users";
import { verificationBadgeClass, verificationLabel } from "@/lib/format";
import type { VerificationStatus } from "@/lib/types";
import AdminNav from "@/components/AdminNav";
import AccountActions from "@/components/AccountActions";

export const metadata: Metadata = { title: "Propriétaires · Administration" };

export const dynamic = "force-dynamic";

export default async function AdminProprietairesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin/proprietaires");
  if (session.user.role !== "admin") redirect("/mon-espace");

  const owners = await getOwnerAccounts();

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        Comptes propriétaires
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        {owners.length} compte{owners.length > 1 ? "s" : ""} avec le rôle propriétaire.
      </p>

      <AdminNav active="/admin/proprietaires" />

      {owners.length === 0 ? (
        <p className="muted">Aucun compte propriétaire pour le moment.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Compte</th>
                <th>Identité</th>
                <th>Annonces</th>
                <th>Membre depuis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="data-table__primary">{o.name || o.email}</span>
                    {o.name && <span className="data-table__sub">{o.email}</span>}
                  </td>
                  <td>
                    <span className={verificationBadgeClass(o.verificationStatus as VerificationStatus)}>
                      {verificationLabel(o.verificationStatus as VerificationStatus)}
                    </span>
                  </td>
                  <td>{o.listingCount}</td>
                  <td>{o.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>
                    <AccountActions userId={o.id} targetRole="visiteur" targetLabel="Rétrograder" />
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
