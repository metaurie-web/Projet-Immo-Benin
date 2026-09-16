/* Configuration de l'authentification (Auth.js / next-auth).

   Connexion par LIEN MAGIQUE uniquement : pas de mot de passe.
   1. L'utilisateur tape son email sur /connexion
   2. next-auth crée un jeton dans la table VerificationToken et appelle
      sendMagicLinkEmail() (src/lib/mail.ts)
   3. En cliquant sur le lien, l'utilisateur est reconnu et une vraie
      session est créée dans la table Session (voir prisma/schema.prisma) */

import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { sendMagicLinkEmail } from "./mail";

export const authOptions: NextAuthOptions = {
  // `@auth/prisma-adapter` cible ses propres types internes (@auth/core),
  // légèrement différents de ceux de next-auth v4 — les deux décrivent
  // pourtant exactement la même forme à l'exécution. D'où ce petit cast,
  // limité à cette seule ligne.
  adapter: PrismaAdapter(prisma) as Adapter,

  // Sessions stockées en base (table Session) plutôt qu'en simple jeton :
  // un changement de rôle (ex. `npm run make-admin`) prend effet
  // immédiatement, sans avoir à se reconnecter.
  session: { strategy: "database" },

  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verification",
    error: "/connexion",
  },

  providers: [
    EmailProvider({
      // Champ obligatoire pour next-auth, mais jamais utilisé : l'envoi
      // réel est entièrement délégué à sendVerificationRequest ci-dessous.
      server: { host: "localhost", port: 587, auth: { user: "", pass: "" } },
      from: process.env.EMAIL_FROM || "Mon Appart <onboarding@resend.dev>",
      maxAge: 24 * 60 * 60, // le lien expire après 24 heures
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url });
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.verificationStatus = user.verificationStatus;
      return session;
    },
  },
};
