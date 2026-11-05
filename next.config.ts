import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Autorise l'accès au serveur de dev depuis l'IP réseau (sinon le JavaScript ne s'hydrate pas).
  allowedDevOrigins: ["192.168.253.1"],
  // La racine renvoie vers le tableau de bord. Une redirection de configuration est traitée avant
  // le rendu, contrairement à redirect() dans une page qui fait échouer la validation du prérendu.
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
