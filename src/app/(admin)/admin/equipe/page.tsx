import type { Metadata } from "next";
import { AdminPlaceholder } from "../../../../components/admin/admin-placeholder.tsx";

export const metadata: Metadata = { title: "Equipe" };

export default function EquipePage() {
  return (
    <AdminPlaceholder
      title="Equipe"
      phase="Fase 02"
      description="O cadastro de barbeiros com foto, serviços que cada um realiza e jornada individual."
      willHave={[
        "Foto, nome e perfil de acesso",
        "Serviços que cada barbeiro executa",
        "Jornada, intervalos e folgas de cada um",
      ]}
    />
  );
}
