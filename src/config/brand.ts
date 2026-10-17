// Identidade da marca CENTRALIZADA. Para uma cópia do produto para outra barbearia
// (decisão: cópias independentes do repositório), este arquivo, public/brand/* e
// os tokens em src/app/globals.css são os pontos de troca.

export const brand = {
  name: "Barbearia Bolonha",
  shortName: "Bolonha",
  tagline: "Corte, barba e hora marcada.",
  foundedYear: 2011,
  /**
   * Logo oficial usada COMO FORNECIDA (sem redesenho).
   * ATENÇÃO: este arquivo foi recortado de uma captura de tela do perfil no
   * Instagram (700×700 px). Substitua pelo arquivo original (PNG/SVG de alta
   * resolução) assim que o proprietário enviar. Basta trocar o arquivo e, se
   * mudar a extensão, o caminho abaixo.
   */
  logo: {
    src: "/brand/logo-bolonha-circulo.png",
    width: 700,
    height: 700,
    alt: "Barbearia Bolonha, desde 2011",
  },
} as const;
