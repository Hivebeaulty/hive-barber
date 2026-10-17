import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { brand } from "../../config/brand.ts";
import { features } from "../../config/features.ts";
import { Logo } from "../brand/logo.tsx";
import { AdminNav } from "./admin-nav.tsx";

/**
 * Casca do painel: lateral no desktop, faixa inferior no celular.
 * Layout de TRABALHO: sem ripado, sem ornamento, foco em densidade legível.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-linha bg-grafite md:block">
        <div className="sticky top-0 flex h-dvh flex-col gap-6 p-4">
          <div className="flex items-center gap-3 px-1 pt-1">
            <Logo size={36} />
            <div className="leading-tight">
              <p className="titulo text-base text-osso">{brand.shortName}</p>
              <p className="text-xs text-aco">Painel de gestão</p>
            </div>
          </div>
          <AdminNav variant="side" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 md:pb-0">
        {!features.adminAuth ? (
          <div role="note" className="flex items-start gap-3 border-b border-linha bg-[#33270d] px-4 py-3 text-sm text-alerta sm:px-6">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              Estrutura sem login: nenhum dado real é exibido. O acesso protegido por perfil chega na Fase 01. Não publique
              esta área antes disso.
            </p>
          </div>
        ) : null}
        <main className="w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 overflow-x-auto border-t border-linha bg-grafite pb-[env(safe-area-inset-bottom)] md:hidden">
        <AdminNav variant="bottom" />
      </div>
    </div>
  );
}
