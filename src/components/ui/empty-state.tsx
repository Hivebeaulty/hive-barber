import type { ReactNode } from "react";
import { cn } from "../../lib/cn.ts";

/**
 * Estado vazio: explica O QUE falta e QUAL é o próximo passo. Nunca preenche com
 * dados de exemplo.
 */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-linha p-6 sm:p-8",
        className,
      )}
    >
      {icon ? <div className="text-azul-claro">{icon}</div> : null}
      <h3 className="titulo text-xl text-osso">{title}</h3>
      {children ? <p className="texto-legivel text-aco">{children}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
