import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import AdminNav from "@/components/AdminNav";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Réglages · Administration" };

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin/parametres");
  if (session.user.role !== "admin") redirect("/mon-espace");

  const settings = await getSettings();

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        Réglages généraux
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        Les autres réglages (paiement Mobile Money, emails…) arriveront ici au fur et à mesure.
      </p>

      <AdminNav active="/admin/parametres" />

      <SettingsForm initialCommission={settings.commissionAmount} />
    </section>
  );
}
