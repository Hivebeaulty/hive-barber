import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <AdminPlaceholder
      title="Clientes"
      phase="Fase 05"
      description="A lista de clientes com histórico de visitas, faltas e atendimentos concluídos."
      willHave={[
        "Busca por nome e telefone",
        "Histórico de visitas",
        "Registro de atendimento concluído e de falta",
      ]}
    />
  );
}
