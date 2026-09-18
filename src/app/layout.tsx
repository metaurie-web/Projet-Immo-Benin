import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AuthProvider from "@/components/AuthProvider";

/* next/font télécharge et héberge les polices avec le site (pas d'appel à
   Google au chargement de la page). Chaque police expose une variable CSS
   que globals.css réutilise. */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-src",
  display: "swap",
});

const body = Lora({
  // Lora est une police « variable » : inutile de lister les graisses.
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Mon Appart — Louer chez son propriétaire, sans démarcheur · Bénin",
    template: "%s — Mon Appart",
  },
  description:
    "Mon Appart réunit les appartements et maisons à louer à Cotonou, Abomey-Calavi, Porto-Novo et Ouidah, " +
    "publiés par les propriétaires eux-mêmes. Loyer, avance et caution affichés avant la visite.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthProvider>
          <a className="skip-link" href="#main">
            Aller au contenu
          </a>
          <SiteHeader />
          <main id="main" className="page-foot-space">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
        {/* Widget de paiement Mobile Money (demandes de visite, publication
            d'une annonce) — pose openKkiapayWidget/addSuccessListener/
            addFailedListener sur window, voir src/types/kkiapay.d.ts. */}
        <Script src="https://cdn.kkiapay.me/k.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
