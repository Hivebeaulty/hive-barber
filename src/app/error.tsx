"use client";

import { Button } from "../components/ui/button.tsx";

// Fronteira de erro global. Mostra o que aconteceu e como seguir; nunca expõe
// detalhes técnicos ao cliente. O erro real vai para o log do servidor.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="display text-6xl text-branco">Algo deu errado</h1>
      <p className="texto-legivel text-aco">
        Não foi possível carregar esta página. Tente de novo; se continuar, ligue para a barbearia.
      </p>
      {error.digest ? <p className="tabular text-sm text-aco">Código: {error.digest}</p> : null}
      <Button onClick={reset}>Tentar de novo</Button>
    </main>
  );
}
