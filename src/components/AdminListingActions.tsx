"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setListingStatusAction, deleteListingAction } from "@/app/admin/actions";
import { statusLabel } from "@/lib/format";
import type { ListingStatus } from "@/lib/types";

const STATUSES: ListingStatus[] = [
  "en_attente",
  "en_ligne",
  "correction_demandee",
  "refusee",
  "expiree",
];

/* Ligne d'actions d'une annonce depuis /admin/annonces : changer le statut
   directement, modifier ses champs, ou la supprimer définitivement. */
export default function AdminListingActions({
  listingRef,
  currentStatus,
}: {
  listingRef: string;
  currentStatus: ListingStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ListingStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveStatus() {
    setError(null);
    startTransition(async () => {
      const result = await setListingStatusAction(listingRef, status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Supprimer définitivement l'annonce ${listingRef} ?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteListingAction(listingRef);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          className="select select--underline"
          style={{ fontSize: 13 }}
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus)}
          disabled={pending}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <button className="btn btn--sm btn--ghost" type="button" onClick={saveStatus} disabled={pending}>
          Appliquer
        </button>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Link className="link-underline" href={`/admin/annonces/${listingRef}/modifier`}>
          Modifier
        </Link>
        <button
          className="link-underline"
          type="button"
          onClick={remove}
          disabled={pending}
          style={{ borderColor: "var(--hair)", color: "var(--grey)" }}
        >
          Supprimer
        </button>
      </div>
      {error && <p style={{ margin: 0, fontSize: 12, color: "#c0392b" }}>{error}</p>}
    </div>
  );
}
