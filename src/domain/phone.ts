// Normalização de telefone brasileiro para CONTATO e identificação do cliente
// (links de ligação, busca e detecção de duplicidade). O número NÃO é verificado
// por código: decisão de produto definitiva, sem SMS (ver docs/ARCHITECTURE.md).
//
// Celular e fixo são reconhecidos; qual deles o agendamento exige é decisão da
// Fase 03. Não "chutamos" o dígito 9: um número errado é pior do que pedir
// correção, pois a barbearia ligaria para outra pessoa.
// A regra será duplicada no banco (função SQL) e precisa ficar igual; os testes
// em tests/phone.test.ts são a especificação executável.

export type PhoneKind = "mobile" | "landline";

export type NormalizedPhone = {
  /** Formato E.164, ex.: +5511912345678 (chave de identidade do cliente). */
  e164: string;
  kind: PhoneKind;
  ddd: string;
  /** Exibição nacional, ex.: (11) 91234-5678. */
  display: string;
};

const VALID_DDD = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

export function normalizeBrPhone(raw: string | null | undefined): NormalizedPhone | null {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2); // prefixo internacional
  if ((digits.length === 11 || digits.length === 12) && digits.startsWith("0")) {
    digits = digits.slice(1); // zero de tronco: 011...
  }
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2); // DDI do Brasil
  }

  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  if (!VALID_DDD.has(ddd)) return null;

  let kind: PhoneKind;
  if (subscriber.length === 9) {
    if (subscriber[0] !== "9") return null;
    kind = "mobile";
  } else {
    // 8 dígitos: fixo (2–5). Celular de 8 dígitos (sem o 9) é inválido.
    if (!/^[2-5]/.test(subscriber)) return null;
    kind = "landline";
  }

  const split = subscriber.length - 4;
  return {
    e164: `+55${ddd}${subscriber}`,
    kind,
    ddd,
    display: `(${ddd}) ${subscriber.slice(0, split)}-${subscriber.slice(split)}`,
  };
}
