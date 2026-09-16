/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autorise next/image à optimiser les photos hébergées sur Vercel Blob
    // (redimensionnement, conversion WebP/AVIF, tailles responsives).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Les pièces d'identité passent par une action serveur (pas d'upload
      // direct navigateur → Blob pour le store PRIVÉ, voir
      // src/app/verification-identite/actions.ts) : il faut de la marge
      // au-delà de la limite par défaut (1 Mo).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
