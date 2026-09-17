/* Ajoute nos champs (id, role, verificationStatus) aux types fournis par
   next-auth, pour ne jamais avoir à écrire de `as any` dans le reste du code. */

import type { DefaultSession } from "next-auth";
import type { UserRole, VerificationStatus } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      verificationStatus: VerificationStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    verificationStatus: VerificationStatus;
  }
}
