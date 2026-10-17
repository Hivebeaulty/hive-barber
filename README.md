# Bolonha App

Agendamento e gestão da **Barbearia Bolonha**: app público (PWA) para o cliente e painel para o proprietário e os barbeiros. Um negócio, uma instância; sem multiempresa.

> **Estado: Fase 00 (fundação).** Existe a estrutura, o design system, a migração base e a lógica de domínio testada. **O agendamento ainda não funciona** e o painel não tem login. Veja `docs/ROADMAP.md`.

## Requisitos

- Node **≥ 22.18** (os testes rodam TypeScript direto, sem build)
- npm
- Para os testes de banco: `psql` e um Postgres local descartável

## Rodar

```bash
cp .env.example .env.local     # preencha as variáveis (sem credenciais reais no repositório)
npm install                    # gera o package-lock.json: commite-o (ainda NÃO existe: o install nunca rodou com sucesso)
npm run dev                    # http://localhost:3000
```

A home e `/agendar` funcionam **sem** Supabase configurado. As funções de `src/lib/supabase/*` só são chamadas a partir da Fase 01 e falham com erro explícito se faltarem variáveis.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint (flat config, `next/core-web-vitals` + `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | testes de domínio (`node --test`, `tests/**/*.test.ts`) |
| `npm run test:db` | aplica `supabase/migrations` em banco **descartável** e roda `supabase/tests/*.test.sql` |
| `node scripts/contrast.mjs` | recalcula os contrastes da paleta |

`npm test`: 15 testes passando. `test:db`: 2 arquivos SQL passando em Postgres descartável (não substitui testes no Supabase real). `lint`, `typecheck` e `build` **ainda não foram executados** com as dependências reais: ver `docs/PHASE_00_REPORT.md`, seção 5.

`test:db` usa as variáveis do libpq (`PGHOST`, `PGUSER`, ...) e recria o banco `bolonha_test`. O script recusa nomes de banco sem `test`, `tmp` ou `scratch`. **Nunca aponte para um banco real.**

## Publicação

GitHub, Supabase e Vercel, passo a passo: `docs/DEPLOY.md`. O CI (`.github/workflows/ci.yml`) roda instalação, lint, typecheck, testes, build e testes SQL.

## Estrutura

```
docs/        REFERENCE_AUDIT, ARCHITECTURE, ROADMAP, DESIGN_SYSTEM, PHASE_00_REPORT
src/app/     rotas: (public) site e agendar, (admin)/admin painel
src/domain/  regras puras testáveis (cancelamento, telefone)
src/config/  marca, dados do negócio, flags, navegação do painel
supabase/    migrations/ e tests/ (com stub do Supabase para Postgres puro)
```

## Marca e dados do negócio

- Logo: `public/brand/logo-bolonha-circulo.png` é **provisória** (recorte de captura de tela). Troque pelo original e ajuste `src/config/brand.ts`.
- Endereço, telefone e horários em `src/config/business.ts` vieram do Instagram e **não foram confirmados**.
- Trocar de marca em uma cópia do produto: `src/config/*`, `public/brand`, `public/icons` e o bloco `@theme` de `src/app/globals.css`.

## Segurança

- Nenhuma credencial no repositório (`.env.local` é ignorado).
- `SUPABASE_SERVICE_ROLE_KEY` nunca recebe o prefixo `NEXT_PUBLIC_` e só é lida em `src/lib/supabase/admin.ts` (`server-only`).
- A área `/admin` não tem autenticação na Fase 00: em produção (`NODE_ENV=production`) o layout responde 404 até a Fase 01 implementar a guarda de sessão e perfil. Em desenvolvimento ela mostra só a estrutura, sem dados.
- Nenhuma migração deve ser aplicada em produção, e nenhum deploy feito, sem autorização explícita.
