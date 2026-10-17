import type { ReactNode } from "react";
import { Pill } from "../ui/pill.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

/**
 * Tela do painel ainda não implementada. Diz o que a tela fará e em que fase
 * chega, sem simular dados.
 */
export function AdminPlaceholder({
  title,
  phase,
  description,
  willHave,
  icon,
}: {
  title: string;
  phase: string;
  description: string;
  willHave: readonly string[];
  icon?: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo text-3xl text-branco">{title}</h1>
        <Pill tone="info">Chega na {phase}</Pill>
      </div>
      <div className="mt-6">
        <EmptyState icon={icon} title="Esta tela ainda não existe">
          {description}
        </EmptyState>
      </div>
      <section aria-labelledby="vai-ter" className="mt-10">
        <h2 id="vai-ter" className="titulo text-xl text-osso">
          O que ela vai ter
        </h2>
        <ul className="mt-4 divide-y divide-linha border-y border-linha">
          {willHave.map((item) => (
            <li key={item} className="py-3 text-osso">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
