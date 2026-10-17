// Calcula razões de contraste WCAG 2.x entre pares de cores do design system.
// Uso: node scripts/contrast.mjs
const C = {
  carvao: "#0d0e10", grafite: "#181b1f", "grafite-alto": "#23272d", aco: "#8c95a1",
  osso: "#edeef0", branco: "#ffffff", azul: "#2f5bff", "azul-forte": "#1f43d6",
  "azul-claro": "#7c97ff", "azul-fundo": "#101a45", mel: "#c28a55", madeira: "#6d4326",
  sucesso: "#46c487", alerta: "#e3ab3f", erro: "#f06262",
};
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(C[a]), lum(C[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ["osso", "carvao", "texto principal"], ["osso", "grafite", "texto em painel"],
  ["aco", "carvao", "texto secundário"], ["aco", "grafite", "texto secundário em painel"],
  ["azul-claro", "carvao", "link/ícone azul"], ["azul-claro", "grafite", "link em painel"],
  ["branco", "azul", "botão primário"], ["branco", "azul-forte", "botão primário (hover)"],
  ["azul-claro", "azul-fundo", "pílula azul"], ["osso", "madeira", "texto sobre ripado"],
  ["branco", "madeira", "texto branco sobre ripado"], ["mel", "carvao", "detalhe em mel"],
  ["sucesso", "carvao", "estado sucesso"], ["alerta", "carvao", "estado alerta"], ["erro", "carvao", "estado erro"],
];
for (const [a, b, uso] of pairs) {
  const r = ratio(a, b);
  console.log(`${r.toFixed(2).padStart(5)}:1  ${a} sobre ${b}  (${uso})  ${r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "só texto grande/UI" : "FALHA"}`);
}
