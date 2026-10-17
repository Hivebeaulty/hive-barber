import { cn } from "../../lib/cn.ts";

/** Bloco de carregamento. Decorativo: o contêiner pai deve anunciar aria-busy. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}
