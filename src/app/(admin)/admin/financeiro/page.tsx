import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Financeiro" };

export default function FinanceiroPage() {
  return (
    <AdminPlaceholder
      title="Financeiro"
      phase="Fase 06"
      description="Receitas, despesas, pagamentos, caixa e comissões, restritos ao proprietário."
      willHave={[
        "Faturamento, recebido, pendente e despesas separados",
        "Caixa e pagamentos por atendimento, sem duplicidade",
        "Regras de comissão e ganhos por barbeiro",
      ]}
    />
  );
}
