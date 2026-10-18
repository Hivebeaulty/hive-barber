import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <AdminPlaceholder
      title="Configurações"
      phase="Fase 02"
      description="Dados da barbearia, horário de funcionamento e regras de cancelamento."
      willHave={[
        "Endereço, telefone e horário de funcionamento",
        "Política de cancelamento",
        "Dados do proprietário",
      ]}
    />
  );
}
