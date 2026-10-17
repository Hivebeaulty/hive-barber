// Política de cancelamento (requisitos aprovados 3 e 4):
//  - o cliente pode cancelar até 2 horas antes do horário agendado;
//  - o proprietário pode cancelar administrativamente mesmo após o limite.
//
// Lógica PURA. A autoridade final é a RPC de cancelamento no banco (Fase 02/03),
// que repete esta regra; aqui só decidimos o que mostrar e traduzimos o motivo.

export const CLIENT_CANCEL_LIMIT_HOURS = 2;

export type CancellationStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export type CancellationDecision =
  | { allowed: true }
  | { allowed: false; reason: "not_active" | "too_late" };

export function canClientCancel(input: {
  status: CancellationStatus;
  startsAt: Date;
  now: Date;
  limitHours?: number;
}): CancellationDecision {
  if (input.status !== "confirmed") return { allowed: false, reason: "not_active" };

  const limitMs = (input.limitHours ?? CLIENT_CANCEL_LIMIT_HOURS) * 60 * 60 * 1000;
  const msUntilStart = input.startsAt.getTime() - input.now.getTime();

  // Exatamente 2h antes ainda é permitido ("até duas horas antes").
  return msUntilStart >= limitMs ? { allowed: true } : { allowed: false, reason: "too_late" };
}

export function canOwnerCancel(input: { status: CancellationStatus }): CancellationDecision {
  // O proprietário ignora o prazo, mas não reabre/cancela o que já foi encerrado.
  return input.status === "confirmed" ? { allowed: true } : { allowed: false, reason: "not_active" };
}

export function cancellationMessage(reason: "not_active" | "too_late"): string {
  return reason === "too_late"
    ? "O prazo para cancelar pelo app terminou (até 2 horas antes). Fale com a barbearia."
    : "Este agendamento não pode mais ser cancelado.";
}
