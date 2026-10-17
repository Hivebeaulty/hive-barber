import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../components/admin/admin-shell.tsx";
import { features } from "../../../config/features.ts";

// O painel nunca deve ser indexado por buscadores.
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Bolonha" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Trava de segurança da Fase 00: sem login implementado, a área NÃO existe em
  // produção. A Fase 01 troca esta checagem pela guarda de sessão e perfil.
  if (!features.adminAuth && process.env.NODE_ENV === "production") notFound();

  return <AdminShell>{children}</AdminShell>;
}
