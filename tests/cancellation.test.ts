import test from "node:test";
import assert from "node:assert/strict";
import {
  canClientCancel,
  canOwnerCancel,
  cancellationMessage,
  CLIENT_CANCEL_LIMIT_HOURS,
} from "../src/domain/cancellation.ts";

const startsAt = new Date("2030-03-10T15:00:00.000Z");
const at = (minutesBeforeStart: number) => new Date(startsAt.getTime() - minutesBeforeStart * 60_000);

test("limite aprovado é de 2 horas", () => {
  assert.equal(CLIENT_CANCEL_LIMIT_HOURS, 2);
});

test("cliente cancela com 3h de antecedência", () => {
  assert.deepEqual(canClientCancel({ status: "confirmed", startsAt, now: at(180) }), { allowed: true });
});

test("cliente cancela exatamente 2h antes (limite inclusivo)", () => {
  assert.deepEqual(canClientCancel({ status: "confirmed", startsAt, now: at(120) }), { allowed: true });
});

test("cliente NÃO cancela 1 minuto depois do limite", () => {
  assert.deepEqual(canClientCancel({ status: "confirmed", startsAt, now: at(119) }), {
    allowed: false,
    reason: "too_late",
  });
});

test("cliente NÃO cancela depois do horário de início", () => {
  assert.deepEqual(canClientCancel({ status: "confirmed", startsAt, now: at(-10) }), {
    allowed: false,
    reason: "too_late",
  });
});

test("cliente não cancela o que já está encerrado", () => {
  for (const status of ["completed", "cancelled", "no_show"] as const) {
    assert.deepEqual(canClientCancel({ status, startsAt, now: at(600) }), { allowed: false, reason: "not_active" });
  }
});

test("proprietário cancela depois do prazo, mas não o que já foi encerrado", () => {
  assert.deepEqual(canOwnerCancel({ status: "confirmed" }), { allowed: true });
  assert.deepEqual(canOwnerCancel({ status: "completed" }), { allowed: false, reason: "not_active" });
});

test("mensagens de recusa orientam o cliente", () => {
  assert.match(cancellationMessage("too_late"), /2 horas/);
  assert.match(cancellationMessage("not_active"), /não pode mais/);
});
