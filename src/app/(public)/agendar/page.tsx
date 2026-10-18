import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { ButtonLink } from "../../../components/ui/button.tsx";
import { EmptyState } from "../../../components/ui/empty-state.tsx";
import { Pill } from "../../../components/ui/pill.tsx";
import { bookingSteps } from "../../../config/booking-steps.ts";
import { business } from "../../../config/business.ts";
import { features } from "../../../config/features.ts";
import { normalizeBrPhone } from "../../../domain/phone.ts";

export const metadata: Metadata = { title: "Agendar horário" };

// ESQUELETO do agendamento. Nenhuma etapa funciona ainda (Fase 04): a página
// mostra o caminho que o cliente vai percorrer e diz com clareza que ainda não
// é possível reservar.
export default function BookingPage() {
  const phone = normalizeBrPhone(business.phone.display);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16">
      <div className="ripado ripado-entra rounded-lg border border-madeira-escura p-6 sm:p-8">
        <h1 className="titulo text-3xl text-branco">Seu horário em cinco passos</h1>
        <ol className="mt-8 space-y-3">
          {bookingSteps.map((step, i) => (
            <li key={step.id} className="flex gap-4 rounded-md bg-carvao/85 p-4">
              <span
                aria-hidden="true"
                className="tabular grid size-9 shrink-0 place-items-center rounded-sm bg-grafite-alto text-sm font-bold text-mel"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-bold text-branco">{step.title}</p>
                <p className="text-[0.95rem] text-osso/90">{step.help}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="md:pt-2">
        {!features.onlineBooking ? (
          <EmptyState
            icon={<Pill tone="warning">Em construção</Pill>}
            title="Ainda não dá para agendar pelo app"
            action={
              phone ? (
                <ButtonLink href={`tel:${phone.e164}`} size="lg">
                  <Phone size={18} aria-hidden="true" /> Ligar para marcar
                </ButtonLink>
              ) : null
            }
          >
            O agendamento online está sendo construído. Enquanto isso, ligue para a barbearia e combine seu horário.
          </EmptyState>
        ) : null}
      </div>
    </div>
  );
}
