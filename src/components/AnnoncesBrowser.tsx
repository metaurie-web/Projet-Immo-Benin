"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Listing } from "@/lib/types";
import { fcfa, fmt, plural } from "@/lib/format";

const TYPES = ["Chambre-salon", "Appartement", "Maison basse", "Villa"] as const;

const ROOMS: { label: string; test: (l: Listing) => boolean }[] = [
  { label: "1", test: (l) => l.rooms === 1 },
  { label: "2", test: (l) => l.rooms === 2 },
  { label: "3", test: (l) => l.rooms === 3 },
  { label: "4+", test: (l) => l.rooms >= 4 },
];

const AMENITIES: { label: string; test: (l: Listing) => boolean }[] = [
  { label: "Meublé", test: (l) => l.furnished },
  { label: "Compteur SBEE individuel", test: (l) => l.meter === "individuel" },
  { label: "Forage ou eau SONEB", test: (l) => /forage|soneb/i.test(l.water) },
  { label: "Parking dans la cour", test: (l) => l.parking },
];

type Sort = "recent" | "asc" | "desc";

export default function AnnoncesBrowser({ listings }: { listings: Listing[] }) {
  const params = useSearchParams();

  const cityFromParam = (params.get("ville") ?? "").split("—")[0].trim();
  const initialBudget = params.get("budget")
    ? Math.min(300000, Math.max(20000, Number(params.get("budget"))))
    : 300000;
  const initialTypes = params.get("type") ? [params.get("type") as string] : [];
  const initialRooms = params.get("chambres")
    ? [params.get("chambres") === "3" ? "3" : (params.get("chambres") as string)]
    : [];

  const [quartier, setQuartier] = useState("");
  const [budget, setBudget] = useState(initialBudget);
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [rooms, setRooms] = useState<string[]>(initialRooms);
  const [amenities, setAmenities] = useState<number[]>([]);
  const [sort, setSort] = useState<Sort>("recent");

  const quartiers = useMemo(
    () =>
      [...new Set(listings.map((l) => `${l.quartier} — ${l.city}`))].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [listings],
  );

  const results = useMemo(() => {
    const matches = (l: Listing) => {
      if (quartier && `${l.quartier} — ${l.city}` !== quartier) return false;
      if (cityFromParam && !quartier && l.city !== cityFromParam) return false;
      if (l.price > budget) return false;
      if (types.length && !types.includes(l.type)) return false;
      if (rooms.length && !rooms.some((r) => ROOMS.find((x) => x.label === r)!.test(l)))
        return false;
      for (const i of amenities) if (!AMENITIES[i].test(l)) return false;
      return true;
    };

    const list = listings.filter(matches);
    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "desc") list.sort((a, b) => b.price - a.price);
    // "recent" = ordre du tableau, on ne touche à rien
    return list;
  }, [listings, quartier, cityFromParam, budget, types, rooms, amenities, sort]);

  const toggle = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

  const reset = () => {
    setQuartier("");
    setBudget(300000);
    setTypes([]);
    setRooms([]);
    setAmenities([]);
    setSort("recent");
  };

  const scope = quartier || (cityFromParam ? `${cityFromParam} · tous quartiers` : "Toutes les villes");

  return (
    <>
      <p className="eyebrow eyebrow--muted" style={{ marginBottom: 8 }}>
        {scope}
      </p>
      <h1
        className="h-serif"
        style={{ fontSize: 38, letterSpacing: "-0.02em", marginBottom: 6 }}
      >
        {results.length} {plural(results.length, "logement")} à louer
      </h1>
      <p style={{ marginBottom: 26, color: "var(--muted)", fontSize: 14 }}>
        Tous publiés par leur propriétaire et validés par notre équipe.
      </p>

      <div className="results-layout">
        <aside className="filters" aria-label="Filtres de recherche">
          <p className="filters__title">Filtres</p>

          <label className="filters__group field">
            <span className="filters__legend">Quartier</span>
            <select
              className="select"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
            >
              <option value="">Tous les quartiers</option>
              {quartiers.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </label>

          <div className="filters__group">
            <span className="filters__legend">Budget mensuel</span>
            <input
              type="range"
              min={20000}
              max={300000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <p className="num" style={{ margin: "6px 0 0", fontSize: 14, color: "var(--deep)" }}>
              Jusqu&apos;à {fmt(budget)} FCFA
            </p>
          </div>

          <div className="filters__group">
            <span className="filters__legend">Type de bien</span>
            <div className="chip-row">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip"
                  aria-pressed={types.includes(t)}
                  onClick={() => setTypes((a) => toggle(a, t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <span className="filters__legend">Chambres</span>
            <div className="chip-row">
              {ROOMS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className="chip"
                  aria-pressed={rooms.includes(r.label)}
                  onClick={() => setRooms((a) => toggle(a, r.label))}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="filters__group"
            style={{ borderTop: "1px solid var(--hair)", paddingTop: 16 }}
          >
            <span className="filters__legend" style={{ marginBottom: 11 }}>
              Équipements
            </span>
            <div className="stack stack--11">
              {AMENITIES.map((a, i) => (
                <label className="check" key={a.label}>
                  <input
                    type="checkbox"
                    checked={amenities.includes(i)}
                    onChange={(e) =>
                      setAmenities((prev) =>
                        e.target.checked ? [...prev, i] : prev.filter((x) => x !== i),
                      )
                    }
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            className="filters__group"
            style={{ borderTop: "1px solid var(--hair)", paddingTop: 16 }}
          >
            <button className="link-underline" type="button" onClick={reset}>
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <div className="results-list">
          <div className="results-list__head">
            <p className="num" style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              {results.length} résultats correspondent à vos filtres
            </p>
            <label
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--grey)" }}
            >
              Trier par
              <select
                className="select select--underline"
                style={{ fontSize: 13.5, color: "var(--deep)" }}
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
              >
                <option value="recent">Plus récentes</option>
                <option value="asc">Loyer croissant</option>
                <option value="desc">Loyer décroissant</option>
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <p className="results-empty">
              Aucun logement ne correspond à ces filtres pour le moment.
              <br />
              Élargissez le budget ou retirez un critère.
            </p>
          ) : (
            results.map((l) => (
              <article className="listing-row" key={l.ref}>
                <div className="listing-row__media">
                  <div className="photo">
                    <span>{l.photos[0]}</span>
                  </div>
                </div>
                <div className="listing-row__body">
                  <div className="listing-row__head">
                    <div>
                      <p className="listing-card__area">
                        {l.quartier}, {l.city}
                      </p>
                      <h2 className="listing-card__title">{l.title}</h2>
                    </div>
                    <p className="listing-row__price num">
                      {fcfa(l.price)}
                      <small> / mois</small>
                    </p>
                  </div>
                  <p className="listing-card__specs">
                    {l.rooms} {plural(l.rooms, "chambre")} ·{" "}
                    {l.furnished ? "meublé" : "non meublé"} · compteur {l.meter} · {l.water}
                    {l.parking ? " · parking" : ""}
                  </p>
                  <p className="listing-card__specs">
                    Avance {l.advance} · Caution {l.deposit}
                  </p>
                  <div className="listing-row__foot">
                    <span className="tag">{l.owner} · vérifié</span>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      ★ {l.rating} ({l.reviews} avis)
                    </span>
                    <Link
                      className="btn btn--sm"
                      style={{ marginLeft: "auto" }}
                      href={`/annonces/${l.ref}`}
                    >
                      Voir et demander une visite
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  );
}
