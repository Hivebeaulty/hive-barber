import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-grafite-alto text-osso",
  info: "bg-azul-fundo text-azul-claro",
  success: "bg-[#0f2a1f] text-sucesso",
  warning: "bg-[#33270d] text-alerta",
  danger: "bg-[#341515] text-erro",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[0.8rem] font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
