// Chaves de funcionalidade. Mantêm a interface HONESTA: um recurso só aparece como
// disponível depois que o roadmap o entrega e a flag é ligada na mesma alteração.
export const features = {
  /** Fase 04: agendamento público de ponta a ponta. */
  onlineBooking: false,
  /** Fase 02: login do painel administrativo. */
  adminAuth: false,
} as const;
