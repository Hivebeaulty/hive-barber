import { CalendarClock } from "lucide-react";
import { EmptyState } from "../../../components/ui/empty-state.tsx";
import { Pill } from "../../../components/ui/pill.tsx";
import { Skeleton } from "../../../components/ui/skeleton.tsx";

export default function AdminTodayPage() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo text-3xl text-branco">Hoje</h1>
        <Pill tone="info">Chega na Fase 02</Pill>
      </div>

      <div className="mt-6">
        <EmptyState icon={<CalendarClock size={22} aria-hidden="true" />} title="A agenda do dia aparece aqui">
          Quando houver barbeiros, serviços e horários cadastrados, esta tela mostra os atendimentos de hoje em ordem,
          com o próximo cliente em destaque.
        </EmptyState>
      </div>

      <section aria-labelledby="previa" className="mt-10">
        <h2 id="previa" className="titulo text-xl text-osso">
          Pré-visualização do carregamento
        </h2>
        <p className="mt-1 text-sm text-aco">Apenas o esqueleto visual. Nenhum dado real.</p>
        <div className="mt-4 space-y-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-linha pb-3">
              <Skeleton className="h-5 w-14" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
