import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <AdminPlaceholder
      title="Agenda"
      phase="Fase 02"
      description="A agenda diária e semanal, geral e por profissional, com criação, edição e cancelamento de agendamentos."
      willHave={[
        "Visão do dia e da semana",
        "Filtro por profissional",
        "Bloqueios, folgas e férias",
        "Cancelamento administrativo após o prazo do cliente",
      ]}
    />
  );
}
