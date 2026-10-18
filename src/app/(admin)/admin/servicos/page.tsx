import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Serviços" };

export default function ServicosPage() {
  return (
    <AdminPlaceholder
      title="Serviços"
      phase="Fase 02"
      description="O catálogo de serviços com categoria, preço e duração fixa."
      willHave={[
        "Categorias, preço e duração",
        "Quais barbeiros executam cada serviço",
        "Ativar e desativar serviços",
      ]}
    />
  );
}
