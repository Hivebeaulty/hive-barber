// Dados de contato e funcionamento da barbearia.
//
// FONTE: capturas de tela do perfil público @barbeariabolonhacanaa no Instagram,
// enviadas em 12/10/2026. NÃO foram confirmadas com o proprietário.
// Estes dados passam para o banco (business_settings, editável pelo proprietário)
// na Fase 02; na Fase 01 viram *seed* da Bolonha (dados, não código). Ver docs/WHITE_LABEL.md.
//
// Nenhum serviço, preço ou profissional é listado aqui de propósito: esses dados
// serão cadastrados pelo proprietário na Fase 02. Até lá a interface mostra
// estados vazios, nunca valores inventados.

export type OpeningPeriod = {
  /** 0 = domingo … 6 = sábado */
  weekdays: readonly number[];
  label: string;
  opens: string;
  closes: string;
};

export const business = {
  address: {
    street: "Av. Gerasa, 1123",
    district: "Canaã",
    city: "Ipatinga",
    state: "MG",
  },
  phone: {
    // Exibição; a versão normalizada vem de normalizeBrPhone() quando necessária.
    display: "(31) 98816-0889",
  },
  instagram: "barbeariabolonhacanaa",
  opening: [
    { weekdays: [2, 3, 4, 5], label: "Terça a sexta", opens: "08:30", closes: "19:30" },
    { weekdays: [6], label: "Sábado", opens: "08:00", closes: "18:00" },
  ] satisfies readonly OpeningPeriod[],
  amenities: ["Ambiente climatizado", "Espaço kids"],
} as const;

export function addressLine(): string {
  const a = business.address;
  return `${a.street}, ${a.district}, ${a.city} - ${a.state}`;
}
