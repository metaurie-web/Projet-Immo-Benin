"use client";

import { useState } from "react";
import { updateCommissionAction } from "@/app/admin/actions";

export default function SettingsForm({ initialCommission }: { initialCommission: number }) {
  const [amount, setAmount] = useState(initialCommission);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateCommissionAction(amount);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      <label className="field" style={{ marginBottom: 20 }}>
        <span className="field__label">Commission de publication (FCFA, pour 30 jours)</span>
        <input
          className="input num"
          type="number"
          min={0}
          step={500}
          value={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
            setSaved(false);
          }}
        />
      </label>
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      {error && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#c0392b" }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--deep)" }}>
          Réglages enregistrés — le nouveau montant s&apos;affichera sur /publier.
        </p>
      )}
    </form>
  );
}
