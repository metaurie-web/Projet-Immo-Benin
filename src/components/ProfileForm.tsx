"use client";

import { useState } from "react";
import { updateProfile } from "@/app/espace-visiteur/actions";

export default function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateProfile(name);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 480 }}>
      <label className="field" style={{ flex: "1 1 220px" }}>
        <span className="field__label">Nom affiché</span>
        <input
          className="input"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          required
        />
      </label>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button className="btn btn--sm" type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
      {error && (
        <p style={{ flexBasis: "100%", margin: 0, fontSize: 12.5, color: "#c0392b" }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ flexBasis: "100%", margin: 0, fontSize: 12.5, color: "var(--deep)" }}>
          Profil mis à jour.
        </p>
      )}
    </form>
  );
}
