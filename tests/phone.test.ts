import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBrPhone } from "../src/domain/phone.ts";

test("celular em vários formatos vira o mesmo E.164", () => {
  const formats = [
    "11912345678",
    "(11) 91234-5678",
    "11 91234 5678",
    "+55 11 91234-5678",
    "5511912345678",
    "0055 11 91234-5678",
    "011 91234-5678",
  ];
  for (const f of formats) {
    assert.equal(normalizeBrPhone(f)?.e164, "+5511912345678", f);
  }
});

test("exibição nacional", () => {
  assert.equal(normalizeBrPhone("31912345678")?.display, "(31) 91234-5678");
  assert.equal(normalizeBrPhone("3132345678")?.display, "(31) 3234-5678");
});

test("fixo e celular são distinguidos", () => {
  const landline = normalizeBrPhone("(31) 3234-5678");
  assert.equal(landline?.kind, "landline");
  assert.equal(landline?.e164, "+553132345678");
  const mobile = normalizeBrPhone("(31) 91234-5678");
  assert.equal(mobile?.kind, "mobile");
  assert.equal(mobile?.e164, "+5531912345678");
});

test("não inventa o dígito 9: celular de 8 dígitos é inválido", () => {
  assert.equal(normalizeBrPhone("31 81234-567"), null);
  assert.equal(normalizeBrPhone("3181234567"), null); // 8 dígitos começando com 8
});

test("9 dígitos precisam começar com 9", () => {
  assert.equal(normalizeBrPhone("31 81234-5678"), null);
});

test("DDD inexistente, tamanhos errados e lixo são inválidos", () => {
  assert.equal(normalizeBrPhone("10912345678"), null); // DDD 10 não existe
  assert.equal(normalizeBrPhone("1234"), null);
  assert.equal(normalizeBrPhone("abc"), null);
  assert.equal(normalizeBrPhone(""), null);
  assert.equal(normalizeBrPhone(null), null);
  assert.equal(normalizeBrPhone(undefined), null);
  assert.equal(normalizeBrPhone("55119123456789"), null); // dígitos demais
});

test("números diferentes não colidem", () => {
  assert.notEqual(normalizeBrPhone("11912345678")?.e164, normalizeBrPhone("11912345679")?.e164);
});
