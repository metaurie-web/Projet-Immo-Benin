"use client";

import { SessionProvider } from "next-auth/react";

/* « use client » : next-auth a besoin de ce fournisseur de contexte React
   pour que useSession() (menu utilisateur, boutons connexion/déconnexion)
   fonctionne n'importe où dans l'arbre de composants. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
