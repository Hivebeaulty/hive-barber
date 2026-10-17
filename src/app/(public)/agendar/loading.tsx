import { Skeleton } from "../../../components/ui/skeleton.tsx";

export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16"
    >
      <span className="sr-only">Carregando o agendamento…</span>
      <div className="space-y-5 rounded-lg border border-linha p-6 sm:p-8">
        <Skeleton className="h-8 w-3/4" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-9" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
