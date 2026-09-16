/* Donne le rôle "admin" à un compte, par email.

   Usage :  npm run make-admin -- toi@exemple.com

   Si le compte n'existe pas encore (personne ne s'est jamais connecté avec
   cet email), il est créé directement avec le rôle admin : il suffira de
   se connecter ensuite par lien magique avec ce même email. */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
  console.error("Usage : npm run make-admin -- toi@exemple.com");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: { email, role: "admin", emailVerified: new Date() },
  });
  console.log(`✔ ${user.email} est maintenant administrateur (role = "${user.role}").`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
