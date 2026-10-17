"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { adminNav, type AdminNavItem } from "../../config/admin-nav.ts";
import { cn } from "../../lib/cn.ts";

const icons: Record<AdminNavItem["icon"], LucideIcon> = {
  today: LayoutDashboard,
  calendar: CalendarDays,
  clients: UserRound,
  team: Users,
  services: Scissors,
  finance: Wallet,
  reports: BarChart3,
  settings: Settings,
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Lateral no desktop, faixa rolável embaixo no celular. */
export function AdminNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação do painel" className={variant === "side" ? "flex flex-col gap-1" : "flex w-max min-w-full"}>
      {adminNav.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center transition-colors duration-[var(--duration-rapida)]",
              variant === "side"
                ? "h-11 gap-3 rounded-md px-3 text-[0.95rem] font-semibold"
                : "min-w-[4.75rem] flex-1 flex-col justify-center gap-1 px-2 py-2 text-[0.72rem] font-semibold",
              active
                ? variant === "side"
                  ? "bg-azul-fundo text-azul-claro"
                  : "text-azul-claro"
                : "text-aco hover:text-osso",
            )}
          >
            <Icon size={variant === "side" ? 19 : 22} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
