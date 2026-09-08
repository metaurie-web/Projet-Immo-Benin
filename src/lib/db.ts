/* Point d'accès unique à la base de données.

   En développement, Next.js recharge le code à chaque sauvegarde. Sans
   précaution, on créerait une nouvelle connexion à chaque rechargement
   jusqu'à saturer la base. On garde donc UNE seule instance de PrismaClient,
   rangée dans une variable globale. */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
