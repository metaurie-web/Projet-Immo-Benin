import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/data";
import { fcfa, plural } from "@/lib/format";
import ListingPhoto from "@/components/ListingPhoto";

type Params = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ref } = await params;
  const l = await getListing(ref);
  if (!l) return { title: "Annonce introuvable" };
  return {
    title: l.title,
    description: `${l.title} — ${l.quartier}, ${l.city}. ${fcfa(l.price)} / mois. ${l.description.slice(0, 120)}…`,
  };
}

export default async function AnnonceDetailPage({ params }: Params) {
  const { ref } = await params;
  const l = await getListing(ref);
  if (!l) notFound();

  const specs = [
    { k: "Type", v: l.type },
    { k: "Chambres", v: String(l.rooms) },
    { k: "Ameublement", v: l.furnished ? "Meublé" : "Non meublé" },
    { k: "Compteur", v: `SBEE ${l.meter}` },
    { k: "Eau", v: l.water },
    { k: "Repère", v: l.landmark },
  ];

  return (
    <section className="wrap section">
      <Link className="link-back" href="/annonces">
        ← Retour aux annonces
      </Link>
      <p className="eyebrow eyebrow--muted" style={{ marginBottom: 8 }}>
        {l.quartier}, {l.city} · réf. {l.ref}
      </p>
      <h1
        className="display"
        style={{ fontSize: "clamp(32px, 4vw, 50px)", maxWidth: "24ch", marginBottom: 24 }}
      >
        {l.title}
      </h1>

      <div className="gallery">
        <div className="gallery__main">
          <ListingPhoto
            src={l.photos[0]}
            className="photo--wide"
            caption={`Photo principale — ${l.photos[0]}`}
            sizes="(min-width: 900px) 700px, 90vw"
          />
        </div>
        <div className="gallery__side">
          {l.photos.slice(1, 3).map((p, i) => (
            <ListingPhoto key={i} src={p} className="photo--square" sizes="200px" />
          ))}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="spec-grid">
            {specs.map((s) => (
              <div className="spec" key={s.k}>
                <p className="spec__key">{s.k}</p>
                <p className="spec__value">{s.v}</p>
              </div>
            ))}
          </div>

          <h2 className="h-serif h-serif--26" style={{ marginBottom: 12 }}>
            Description du propriétaire
          </h2>
          <p className="prose" style={{ maxWidth: "62ch", marginBottom: 30 }}>
            {l.description}
          </p>

          <h2 className="h-serif h-serif--26" style={{ marginBottom: 14 }}>
            Ce que vous payez
          </h2>
          <table className="cost-table" style={{ marginBottom: 14 }}>
            <tbody>
              {l.costRows.map((r) => (
                <tr key={r.k}>
                  <td>{r.k}</td>
                  <td>{r.v}</td>
                </tr>
              ))}
              <tr className="total">
                <td>Total à l&apos;entrée</td>
                <td>{fcfa(l.totalIn)}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: "0 0 30px", fontSize: 13.5, color: "var(--deep)" }}>
            Aucun frais de démarcheur. Aucune commission d&apos;agence. Ce tableau est celui
            déclaré par le propriétaire.
          </p>

          <h2 className="h-serif h-serif--26" style={{ marginBottom: 14 }}>
            Avis des visiteurs
          </h2>
          {l.reviewList.length > 0 ? (
            l.reviewList.map((r, i) => (
              <div className="review" key={i}>
                <p className="review__meta">
                  {r.who} · {r.when} · <span className="stars">★ {r.stars}</span>
                </p>
                <p className="review__text">{r.text}</p>
              </div>
            ))
          ) : (
            <p className="muted" style={{ fontSize: 14 }}>
              Ce bien n&apos;a pas encore reçu d&apos;avis. Les avis sont laissés par les
              visiteurs après leur rendez-vous.
            </p>
          )}
        </div>

        <aside className="detail-aside">
          <div>
            <p className="price-big num">
              {fcfa(l.price).replace(" FCFA", "")} <small>FCFA / mois</small>
            </p>
          </div>
          <div style={{ borderTop: "1px solid var(--hair)", paddingTop: 16 }}>
            <p className="eyebrow eyebrow--muted" style={{ marginBottom: 6 }}>
              Propriétaire
            </p>
            <p className="h-serif h-serif--20" style={{ marginBottom: 4 }}>
              {l.owner}
            </p>
            <p style={{ margin: "0 0 10px", fontSize: 13.5, color: "var(--muted)" }}>
              {l.ownerCount} {plural(l.ownerCount, "bien")} sur Mon Appart · membre depuis{" "}
              {l.ownerSince}
            </p>
            <span className="tag">Identité et titre de propriété vérifiés</span>
          </div>
          <Link className="btn btn--full" href={`/annonces/${l.ref}/visite`}>
            Demander une visite
          </Link>
          <p style={{ margin: 0, fontSize: 13, color: "var(--grey)", lineHeight: 1.6 }}>
            Choisissez l&apos;un des créneaux que le propriétaire a proposés. Il reçoit votre
            demande immédiatement et confirme depuis son espace.
          </p>
        </aside>
      </div>
    </section>
  );
}
