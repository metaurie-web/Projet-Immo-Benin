"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateListingAction, type UpdateListingInput } from "@/app/admin/actions";
import { statusLabel } from "@/lib/format";
import type { Listing, ListingStatus } from "@/lib/types";

const STATUSES: ListingStatus[] = [
  "en_attente",
  "en_ligne",
  "correction_demandee",
  "refusee",
  "expiree",
];

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState<UpdateListingInput>({
    title: listing.title,
    price: listing.price,
    description: listing.description,
    featured: listing.featured,
    status: listing.status,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof UpdateListingInput>(key: K, value: UpdateListingInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateListingAction(listing.ref, form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 700 }}>
      <label className="field form-grid__full">
        <span className="field__label">Titre</span>
        <input
          className="input"
          type="text"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Loyer mensuel (FCFA)</span>
        <input
          className="input num"
          type="number"
          min={5000}
          step={1000}
          required
          value={form.price}
          onChange={(e) => set("price", Number(e.target.value))}
        />
      </label>

      <label className="field">
        <span className="field__label">Statut</span>
        <select
          className="select"
          value={form.status}
          onChange={(e) => set("status", e.target.value as ListingStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <div className="field form-grid__full" style={{ justifyContent: "center" }}>
        <label className="check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          <span>Mise en avant sur l&apos;accueil</span>
        </label>
      </div>

      <label className="field form-grid__full">
        <span className="field__label">Description</span>
        <textarea
          className="textarea"
          rows={5}
          required
          minLength={30}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>

      {error && (
        <p
          className="form-grid__full"
          style={{ margin: 0, fontSize: 13, color: "#c0392b" }}
        >
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="form-grid__full" style={{ margin: 0, fontSize: 13, color: "var(--deep)" }}>
          Enregistré.
        </p>
      )}

      <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
