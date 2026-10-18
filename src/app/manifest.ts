import type { MetadataRoute } from "next";
import { brand } from "../config/brand.ts";

// Manifesto do PWA. A instalação completa (service worker, offline, ícones
// "maskable" definitivos) é entregue na Fase 08; ver docs/ROADMAP.md.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: "Agende corte e barba na Barbearia Bolonha.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d0e10",
    theme_color: "#0d0e10",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
