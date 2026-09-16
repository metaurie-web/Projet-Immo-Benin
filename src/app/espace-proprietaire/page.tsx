import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ConfirmButton from "@/components/ConfirmButton";

export const metadata: Metadata = {
  title: "Espace propriétaire",
  description:
    "Suivez vos annonces, les vues et les demandes de visite, confirmez les rendez-vous et " +
    "gérez les créneaux que vous proposez aux visiteurs.",
};

/* Données de démonstration — remplacées plus tard par la base de données,
   filtrées sur le propriétaire connecté. */
const KPIS = [
  { k: "Annonces en ligne", v: "1" },
  { k: "Vues ce mois", v: "412" },
  { k: "Visites demandées", v: "9" },
  { k: "Jours restants", v: "22" },
];

const OWNER_LISTINGS = [
  { title: "Appartement 2 chambres, cour clôturée", area: "Fidjrossè, Cotonou", price: "90 000", views: "412", requests: "9", status: "En ligne", badge: "tag" },
  { title: "Chambre-salon, entrée indépendante", area: "Fidjrossè, Cotonou", price: "40 000", views: "37", requests: "0", status: "En validation", badge: "tag tag--neutral" },
  { title: "Magasin sur rue pavée", area: "Fidjrossè, Cotonou", price: "60 000", views: "188", requests: "3", status: "Expirée", badge: "tag tag--neutral" },
];

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
          <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--grey)" }}>
            Les annonces et demandes ci-dessous sont encore des données de démonstration — la
            prochaine étape les remplacera par les vraies données de{" "}
            <strong>{session.user.email}</strong>.
          </p>
        </div>
        <Link className="btn" href="/publier">
          Publier un nouveau bien
        </Link>
      </div>

      <div className="kpi-band" style={{ marginBottom: 38 }}>
        {KPIS.map((s) => (
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
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bien</th>
              <th>Loyer</th>
              <th>Vues</th>
              <th>Visites demandées</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {OWNER_LISTINGS.map((l) => (
              <tr key={l.title}>
                <td>
                  <span className="data-table__primary">{l.title}</span>
                  <span className="data-table__sub">{l.area}</span>
                </td>
                <td>{l.price}</td>
                <td>{l.views}</td>
                <td>{l.requests}</td>
                <td>
                  <span className={l.badge}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 0", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Demandes de visite à confirmer
      </h2>
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
