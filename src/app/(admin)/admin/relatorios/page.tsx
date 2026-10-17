import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Relatórios" };

export default function RelatoriosPage() {
  return (
    <AdminPlaceholder
      title="Relatórios"
      phase="Fase 06"
      description="Indicadores e relatórios financeiros e de operação."
      willHave={[
        "Resultado por período",
        "Ocupação da agenda e faltas",
        "Desempenho por profissional",
      ]}
    />
  );
}
