import { ButtonLink } from "../components/ui/button.tsx";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="display text-7xl text-branco">Página não encontrada</h1>
      <p className="texto-legivel text-aco">O endereço pode ter mudado ou ter sido digitado errado.</p>
      <ButtonLink href="/">Voltar ao início</ButtonLink>
    </main>
  );
}
