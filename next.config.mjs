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
};

export default nextConfig;
