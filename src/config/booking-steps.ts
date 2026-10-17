// Etapas do agendamento público (requisitos da seção 3.A do briefing).
// É uma SEQUÊNCIA de verdade, por isso a interface pode numerá-las.
export const bookingSteps = [
  { id: "service", title: "Serviço", help: "Corte, barba ou os dois, com preço e duração à vista." },
  { id: "barber", title: "Barbeiro", help: "Escolha quem vai atender, com foto e nome." },
  { id: "time", title: "Dia e horário", help: "Só aparecem horários realmente livres para aquele barbeiro." },
  { id: "contact", title: "Seus dados", help: "Nome e telefone, para a barbearia falar com você se precisar." },
  { id: "confirm", title: "Confirmação", help: "O horário é confirmado na hora, sem esperar resposta." },
] as const;

export type BookingStepId = (typeof bookingSteps)[number]["id"];
