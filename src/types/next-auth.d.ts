/* Ajoute nos champs (id, role) aux types fournis par next-auth, pour ne
   jamais avoir à écrire de `as any` dans le reste du code. */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}
