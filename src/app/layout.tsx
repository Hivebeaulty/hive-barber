import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { brand } from "../config/brand.ts";
import "./globals.css";

// Archivo variável com eixo de largura (wdth): a mesma família entrega o título
// condensado e pesado (.display) e o corpo em largura normal. Uma família só.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: "Agende corte e barba na Barbearia Bolonha, em Ipatinga.",
  applicationName: brand.name,
  // Fora do ar para buscadores até o lançamento: só liga com NEXT_PUBLIC_ALLOW_INDEXING=true.
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0e10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
