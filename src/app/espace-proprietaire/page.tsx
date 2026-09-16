import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getListingsByOwner } from "@/lib/data";
import { fcfa, statusBadgeClass, statusLabel } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

export const metadata: Metadata = {
  title: "Espace propriétaire",
  description:
    "Suivez vos annonces et leur statut de validation, confirmez les rendez-vous et gérez les " +
    "créneaux que vous proposez aux visiteurs.",
};

// Toujours relire la base de données : une annonce qui vient d'être publiée
// ou validée doit apparaître tout de suite.
export const dynamic = "force-dynamic";

/* Les demandes de visite et les créneaux restent des données de démonstration
   — le modèle VisitRequest (base de données) arrive à l'étape suivante. */
const VISIT_REQUESTS = [
  { who: "Bernadette H.", meta: "Samedi 12 sept., 09h00 · Appt 2 chambres · +229 01 97 44 12 08" },
  { who: "Moïse T.", meta: "Dimanche 13 sept., 16h00 · Appt 2 chambres · +229 01 96 08 71 30" },
  { who: "Grâce D.", meta: "Mardi 15 sept., 17h30 · Appt 2 chambres · +229 01 99 15 60 22" },
];

const OWNER_SLOTS = [
  "Sam. 12 sept. 09h00",
  "Sam. 12 sept. 11h00",
  "Dim. 13 sept. 16h00",
  "Mar. 15 sept. 17h30",
  "Mer. 16 sept. 08h00",
];

export default async function EspaceProprietairePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/espace-proprietaire");

  const listings = await getListingsByOwner(session.user.id);
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
        Demandes de visite à confirmer
      </h2>
      <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--grey)" }}>
        Section encore en démonstration — les vraies demandes de visite arrivent à l&apos;étape
        suivante.
      </p>
      <div>
        {VISIT_REQUESTS.map((v) => (
          <div className="request-row" key={v.who}>
            <div>
              <p className="request-row__who">{v.who}</p>
              <p className="request-row__meta">{v.meta}</p>
            </div>
            <ConfirmButton />
          </div>
        ))}
      </div>

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 0", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Créneaux que je propose aux visiteurs
      </h2>
      <div className="slot-tags">
        {OWNER_SLOTS.map((s) => (
          <span className="slot-tag" key={s}>
            {s}
          </span>
        ))}
        <button className="slot-tag slot-tag--add" type="button">
          + Ajouter un créneau
        </button>
      </div>
    </section>
  );
}
