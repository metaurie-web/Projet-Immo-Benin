"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserRoleAction, deleteAccountAction } from "@/app/admin/actions";
import type { UserRole } from "@/lib/types";

/* Actions d'un compte depuis /admin/proprietaires ou /admin/visiteurs :
   changer de rôle (promotion/rétrogradation manuelle) et supprimer. */
export default function AccountActions({
  userId,
  targetRole,
  targetLabel,
}: {
  userId: string;
  targetRole: UserRole;
  targetLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeRole() {
    setError(null);
    startTransition(async () => {
      const result = await changeUserRoleAction(userId, targetRole);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Supprimer définitivement ce compte ?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction(userId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn--sm btn--ghost" type="button" onClick={changeRole} disabled={pending}>
          {targetLabel}
        </button>
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
