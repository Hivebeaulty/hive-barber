// Navegação do painel. "roles" documenta QUEM verá o item quando a autorização
// existir (Fase 01). Esconder um item NÃO é segurança: cada rota e cada consulta
// será protegida no servidor e no banco (RLS).
export type AdminRole = "owner" | "barber";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Ícone: nome do componente em lucide-react, resolvido em admin-nav.tsx. */
  icon: "today" | "calendar" | "clients" | "team" | "services" | "finance" | "reports" | "settings";
  roles: readonly AdminRole[];
  /** Fase do roadmap que entrega a tela. */
  phase: string;
};

export const adminNav: readonly AdminNavItem[] = [
  { href: "/admin", label: "Hoje", icon: "today", roles: ["owner", "barber"], phase: "Fase 02" },
  { href: "/admin/agenda", label: "Agenda", icon: "calendar", roles: ["owner", "barber"], phase: "Fase 02" },
  { href: "/admin/clientes", label: "Clientes", icon: "clients", roles: ["owner", "barber"], phase: "Fase 04" },
  { href: "/admin/equipe", label: "Equipe", icon: "team", roles: ["owner"], phase: "Fase 01" },
  { href: "/admin/servicos", label: "Serviços", icon: "services", roles: ["owner"], phase: "Fase 01" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "finance", roles: ["owner"], phase: "Fase 05" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "reports", roles: ["owner"], phase: "Fase 06" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "settings", roles: ["owner"], phase: "Fase 01" },
];
