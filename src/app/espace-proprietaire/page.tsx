import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getListingsByOwner } from "@/lib/data";
import { fcfa, statusBadgeClass, statusLabel, verificationBadgeClass, verificationLabel } from "@/lib/format";
import { getSlotsForListing, getVisitRequestsForOwner } from "@/lib/visits";
import ConfirmButton from "@/components/ConfirmButton";
import SlotManager from "@/components/SlotManager";

export const metadata: Metadata = {
  title: "Espace propriétaire",
  description:
    "Suivez vos annonces et leur statut de validation, confirmez les rendez-vous et gérez les " +
    "créneaux que vous proposez aux visiteurs.",
};

// Toujours relire la base de données : une annonce qui vient d'être publiée
// ou validée doit apparaître tout de suite.
export const dynamic = "force-dynamic";

const VISIT_STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  refusee: "Refusée",
};

export default async function EspaceProprietairePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/espace-proprietaire");

  // Espace réservé aux propriétaires : chacun est renvoyé vers le sien,
  // qu'il ait tapé cette URL par erreur ou volontairement.
  if (session.user.role === "admin") redirect("/admin");
  if (session.user.role !== "proprietaire") redirect("/espace-visiteur");

  const listings = await getListingsByOwner(session.user.id);
  const visitRequests = await getVisitRequestsForOwner(session.user.id);
  const slotsByListing = Object.fromEntries(
    await Promise.all(
      listings.map(async (l) => [l.ref, await getSlotsForListing(l.ref)] as const),
    ),
  );
  const enLigne = listings.filter((l) => l.status === "en_ligne").length;
  const enAttente = listings.filter(
    (l) => l.status === "en_attente" || l.status === "correction_demandee",
  ).length;

  const kpis = [
    { k: "Annonces en ligne", v: enLigne },
    { k: "En attente de validation", v: enAttente },
    { k: "Total des annonces", v: listings.length },
  ];

  return (
    <section className="wrap section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            Espace propriétaire
          </p>
          <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)" }}>
            Bonjour, {session.user.name || session.user.email}
          </h1>
          <p style={{ marginTop: 10 }}>
            <Link
              href="/verification-identite"
              className={verificationBadgeClass(session.user.verificationStatus)}
              style={{ textDecoration: "none" }}
            >
              {verificationLabel(session.user.verificationStatus)}
            </Link>
          </p>
        </div>
        <Link className="btn" href="/publier">
          Publier un nouveau bien
        </Link>
      </div>

      <div className="kpi-band" style={{ marginBottom: 38 }}>
        {kpis.map((s) => (
          <div className="kpi" key={s.k}>
            <p className="kpi__key">{s.k}</p>
            <p className="kpi__value num">{s.v}</p>
          </div>
        ))}
      </div>

      <h2
        className="h-serif h-serif--26"
        style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 10, marginBottom: 0 }}
      >
        Mes annonces
      </h2>
      {listings.length === 0 ? (
        <p className="muted" style={{ padding: "24px 0" }}>
          Tu n&apos;as encore publié aucune annonce.{" "}
          <Link href="/publier" className="link-underline">
            Publier mon premier bien
          </Link>
        </p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bien</th>
                <th>Loyer</th>
                <th>Statut</th>
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
                  <td>{fcfa(l.price)}</td>
                  <td>
                    <span className={statusBadgeClass(l.status)}>{statusLabel(l.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 0", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Demandes de visite
      </h2>
      {visitRequests.length === 0 ? (
        <p className="muted" style={{ padding: "24px 0" }}>
          Aucune demande de visite pour l&apos;instant.
        </p>
      ) : (
        <div>
          {visitRequests.map((v) => (
            <div className="request-row" key={v.id} data-done={v.status !== "en_attente"}>
              <div>
                <p className="request-row__who">{v.name}</p>
                <p className="request-row__meta">
                  {v.listingTitle} · {v.slotLabel} · {v.phone}
                </p>
                {v.message && <p className="request-row__meta">« {v.message} »</p>}
                {v.status !== "en_attente" && (
                  <p className="request-row__meta">{VISIT_STATUS_LABEL[v.status]}</p>
                )}
              </div>
              <ConfirmButton requestId={v.id} initialStatus={v.status} />
            </div>
          ))}
        </div>
      )}

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 0", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Créneaux que je propose aux visiteurs
      </h2>
      {listings.length === 0 ? (
        <p className="muted" style={{ padding: "24px 0" }}>
          Publie un bien pour pouvoir y proposer des créneaux de visite.
        </p>
      ) : (
        listings.map((l) => (
          <div key={l.ref} style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)" }}>
            <p className="request-row__who" style={{ marginBottom: 4 }}>
              {l.title}
            </p>
            <SlotManager listingRef={l.ref} initialSlots={slotsByListing[l.ref] ?? []} />
          </div>
        ))
      )}
    </section>
  );
}
