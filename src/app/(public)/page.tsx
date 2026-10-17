import { Clock, MapPin, Phone, Scissors, Users } from "lucide-react";
import { Logo } from "../../components/brand/logo.tsx";
import { OpeningHours } from "../../components/site/opening-hours.tsx";
import { ButtonLink } from "../../components/ui/button.tsx";
import { EmptyState } from "../../components/ui/empty-state.tsx";
import { Pill } from "../../components/ui/pill.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { brand } from "../../config/brand.ts";
import { addressLine, business } from "../../config/business.ts";
import { features } from "../../config/features.ts";
import { normalizeBrPhone } from "../../domain/phone.ts";

export default function HomePage() {
  const phone = normalizeBrPhone(business.phone.display);

  return (
    <>
      {/* Abertura: a promessa do produto e a fachada (ripado + logo oficial). */}
      <section className="border-b border-linha">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-20">
          <div>
            {!features.onlineBooking ? (
              <Pill tone="info" className="mb-6">
                <Clock size={14} aria-hidden="true" /> Agendamento online em construção
              </Pill>
            ) : null}
            <h1 className="display text-[clamp(3rem,9vw,6.5rem)] text-branco">
              Corte e barba com hora marcada.
            </h1>
            <p className="texto-legivel mt-6 text-lg text-aco">
              Desde {brand.foundedYear} na Canaã, em Ipatinga. Em breve você escolhe o serviço, o barbeiro e o horário
              direto no celular.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/agendar" size="lg">
                {features.onlineBooking ? "Agendar horário" : "Ver como vai funcionar"}
              </ButtonLink>
              {phone ? (
                <ButtonLink href={`tel:${phone.e164}`} variant="secondary" size="lg">
                  <Phone size={18} aria-hidden="true" /> Ligar para a barbearia
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <div className="ripado ripado-entra relative grid aspect-[4/5] place-items-center overflow-hidden rounded-lg border border-madeira-escura md:aspect-square">
            <Logo size={260} priority className="h-auto w-[62%] max-w-[260px] shadow-[0_18px_40px_rgb(0_0_0/0.55)]" />
          </div>
        </div>
      </section>

      {/* Serviços e equipe: vazios até o proprietário cadastrar (Fase 01). */}
      <section className="border-b border-linha">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="titulo text-3xl text-branco">Serviços e preços</h2>
            <div className="mt-6">
              <EmptyState
                icon={<Scissors size={22} aria-hidden="true" />}
                title="Os serviços aparecem aqui"
                action={
                  <div className="w-64 max-w-full space-y-2" aria-hidden="true">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                }
              >
                A barbearia ainda vai cadastrar corte, barba e demais serviços, com preço e duração.
              </EmptyState>
            </div>
          </div>

          <div>
            <h2 className="titulo text-3xl text-branco">Equipe</h2>
            <div className="mt-6">
              <EmptyState
                icon={<Users size={22} aria-hidden="true" />}
                title="Os barbeiros aparecem aqui"
                action={
                  <div className="flex gap-3" aria-hidden="true">
                    <Skeleton className="size-14 rounded-full" />
                    <Skeleton className="size-14 rounded-full" />
                    <Skeleton className="size-14 rounded-full" />
                  </div>
                }
              >
                Cada profissional terá foto, nome e os serviços que realiza.
              </EmptyState>
            </div>
          </div>
        </div>
      </section>

      {/* Visita: dados reais do perfil público; confirmar com o proprietário. */}
      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="titulo text-3xl text-branco">Como chegar</h2>
            <p className="mt-6 flex items-start gap-3 text-osso">
              <MapPin size={20} className="mt-0.5 shrink-0 text-azul-claro" aria-hidden="true" />
              <span>{addressLine()}</span>
            </p>
            {phone ? (
              <p className="mt-3 flex items-center gap-3">
                <Phone size={20} className="shrink-0 text-azul-claro" aria-hidden="true" />
                <a href={`tel:${phone.e164}`} className="tabular text-osso underline-offset-4 hover:underline">
                  {phone.display}
                </a>
              </p>
            ) : null}
            <ul className="mt-6 flex flex-wrap gap-2">
              {business.amenities.map((a) => (
                <li key={a}>
                  <Pill>{a}</Pill>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="titulo text-3xl text-branco">Horário de funcionamento</h2>
            <div className="mt-6">
              <OpeningHours />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
