import Link from "next/link";
import { brand } from "../../config/brand.ts";
import { Logo } from "../brand/logo.tsx";
import { ButtonLink } from "../ui/button.tsx";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-linha bg-carvao">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${brand.name}, página inicial`}>
          <Logo size={40} priority />
          <span className="titulo truncate text-lg text-osso">{brand.name}</span>
        </Link>
        <ButtonLink href="/agendar" size="md">
          Agendar
        </ButtonLink>
      </div>
    </header>
  );
}
