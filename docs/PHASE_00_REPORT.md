# Relatório da Fase 00

Datas: 12 e 13/10/2026 (entrega inicial); 14/10/2026 (rodada de conclusão).

**Situação: a Fase 00 NÃO está tecnicamente validada.** Tudo o que podia ser verificado sem acesso ao registry do npm foi verificado e passou. O que depende de `npm install` (lint, typecheck com tipos reais, build) está **bloqueado por rede** e consta abaixo como bloqueado, nunca como aprovado. O procedimento para fechar a fase em um ambiente autorizado está na seção 5.

## 1. Decisão de produto desta rodada: sem SMS

Decisão definitiva: nenhum SMS, nenhum provedor, nenhum custo por mensagem, nenhuma dependência arquitetural. WhatsApp não entra como substituto.

- Estava planejado: OTP por SMS para o cliente (`ARCHITECTURE.md`, `ROADMAP.md`), variáveis `SMS_PROVIDER`/`SMS_API_KEY`, helper `toSmsCapableE164` e "provedor de SMS" como decisão que bloqueava a Fase 03. Tudo isso foi removido ou reescrito.
- O que dependia de SMS: **apenas** o critério "telefone verificado antes de reservar" (Fase 03). Nenhuma das 14 regras de negócio aprovadas exige SMS. A alternativa sem custo por mensagem está proposta em `ARCHITECTURE.md`, seção 4.2 (telefone como contato não verificado; controle da reserva por segredo de aparelho/link com hash no banco; antiabuso por limites no banco, teto de reservas ativas, honeypot e bloqueio de número). **É uma proposta que aguarda sua aprovação; nada estrutural foi feito com base nela** e ela não bloqueia as Fases 01 e 02.
- Equipe: e-mail + senha no Supabase Auth, cadastro público desligado, usuários criados pelo servidor. Recuperação de senha avaliada em três opções sem SMS (`ARCHITECTURE.md`, seção 4.1); proposta inicial: redefinição pelo proprietário com troca forçada + quebra-vidro do proprietário, e redefinição por e-mail apenas se houver SMTP configurado (sem custo obrigatório; o limite do SMTP padrão do Supabase **não foi verificado**).
- A autenticação continua evolutiva (2FA por TOTP ou link mágico por e-mail podem ser acrescentados sem refazer RLS).

## 2. Resultado individual de cada verificação

### Executadas (resultado real)

| # | Verificação | Comando / método | Resultado |
| --- | --- | --- | --- |
| 1 | Testes de domínio | `npm test` (`node --test`, Node 22.22.0) | **15 de 15 passaram** (cancelamento: limite inclusivo de 2 h, owner sem prazo, mensagens; telefone: móvel/fixo, DDD, formatos inválidos). Eram 16 antes: o teste do helper de SMS saiu junto com o helper |
| 2 | Migração `0001` em Postgres 16 descartável | `scripts/db-test.sh` (Postgres puro + stub do Supabase) | **passou** |
| 3 | `0001_foundation.test.sql` | idem | **passou**: fuso do negócio (23h30 em Brasília = dia local anterior, independente do fuso da sessão), `btree_gist` fora do schema `public`, trigger `updated_at`, função nova **não** executável por `anon`/`authenticated` |
| 4 | `0002_security_guards.test.sql` | idem | **passou**: nenhuma tabela do schema `public` sem RLS; funções executáveis por `anon` = exatamente `app_timezone`, `local_date`, `local_today`; o detector tem auto-teste (cria tabela sem RLS e função exposta, confirma a detecção, remove) |
| 5 | Concorrência do padrão de agenda | execução avulsa (**não versionada**), tabela descartável com `EXCLUDE USING gist` | 25 inserções simultâneas do mesmo horário: **exatamente 1 vence**; transação bloqueada falha com `23P01` depois do commit da primeira. Prova o padrão, **não** a tabela real (Fase 02) |
| 6 | TypeScript do domínio | `tsc` 6.0.3 global, `strict` + `noUncheckedIndexedAccess` + `erasableSyntaxOnly` | sem erros |
| 7 | Contraste da paleta | `node scripts/contrast.mjs` | todos os pares AA ou melhor (menor: erro sobre carvão, 6,10:1) |
| 8 | Render das telas (home, `/agendar`, 8 telas do painel) | CSS real do Tailwind 4.3.3 pré-instalado + `react-dom/server` + Chromium (Playwright) em 390 e 1280 px | renderizam sem erro; as imagens em `docs/assets/` foram regeradas. **Limitação:** Inter no lugar da Archivo, glifos Lucide via `react-icons` (aproximação, não o pacote real), logo provisória |
| 9 | Áurea (referência) | 52 testes de lógica pura numa cópia; migrações 0001–0013 em Postgres limpo; 4 sondas | ver `REFERENCE_AUDIT.md`. Arquivos do Áurea **não foram alterados** (0 de 133 modificados) |

### Bloqueadas (não aprovadas)

| # | Verificação | Causa | Estado |
| --- | --- | --- | --- |
| B1 | `npm install` | **Tentado de novo em 14/10** (`timeout 60 npm install`): `ENOTFOUND`/erro de rede. O DNS do registry do npm não resolve neste ambiente; o GitHub responde 403 pelo proxy. Não contornei a política de rede | **BLOQUEADA** |
| B2 | `package-lock.json` | Só deve ser gerado depois de instalação válida | **NÃO GERADO** (de propósito) |
| B3 | `npm run lint` | depende de B1 | **BLOQUEADA** |
| B4 | `npm run typecheck` com tipos reais | depende de B1. O `tsc` com *shims* (item 6 e checagem do TSX) só confere sintaxe, imports e identificadores; **não é validação** e não conta como aprovação | **BLOQUEADA** |
| B5 | `npm run build` (Next.js) | depende de B1. Nada garante ainda que o app compile | **BLOQUEADA** |
| B6 | Fonte Archivo (`next/font/google`, `axes: ["wdth"]`) | só carrega no build | **BLOQUEADA** |
| B7 | Ícones reais do `lucide-react` (nomes `AlertTriangle`, `BarChart3` etc. na faixa `^0.462`) | depende de B1 | **BLOQUEADA** |
| B8 | Inspeção das telas a 390 e 1280 px **com as dependências definitivas** | depende de B1/B5 | **BLOQUEADA** (a prévia do item 8 é só indicativa) |
| B9 | Confirmação de versões e compatibilidade no registry | sem acesso ao registry | **BLOQUEADA** (ver seção 4) |
| B10 | Migração, ACLs e RLS no **Supabase real** | **Atualização de 17/10:** com sua autorização, `0001` e `0002` foram aplicadas ao projeto Hive Barber. Verificado no banco real: 0 tabelas sem RLS; `anon` executa só as 3 funções esperadas; função de trigger não executável por `anon`/`authenticated`; `btree_gist` em `extensions`; advisor de segurança limpo. RLS de tabelas de negócio e PostgREST: sem tabelas ainda | **PARCIALMENTE CONCLUÍDA** (migração e ACLs: sim; RLS real: Fase 01) |
| B11 | Guarda de produção de `/admin` (`notFound()`) | exige `next build`/`start` | **BLOQUEADA** |
| B12 | PWA instalado, telas em iOS/Android reais | fora do alcance do ambiente | **PENDENTE** (Fase 07) |

## 3. Problemas encontrados e correções

| Problema | Como apareceu | Correção |
| --- | --- | --- |
| Funções novas ficavam executáveis por `anon` | teste SQL da migração | dois `alter default privileges` (um **sem** `in schema`, para o `PUBLIC` embutido; outro `in schema public`) |
| `set_updated_at` ficou exposta a `anon` | guarda `0002`, criada nesta rodada | a seção de privilégios padrão passou a vir **antes** de qualquer função; teste de regressão permanente |
| SMS em código e configuração | decisão de produto | removidos helper, teste, variáveis de ambiente e textos; passo de contato do agendamento reescrito |
| CSS solto vencia utilitários do Tailwind (`rounded-full` ignorado) | inspeção visual | classes próprias em `@layer components` |
| Esqueleto colapsado em estado vazio | inspeção visual | `w-64 max-w-full` |
| Emendas do ripado cortavam o texto | inspeção visual | passos sobre placas `bg-carvao/85` |
| Preview ignorava classes arbitrárias com `()` | harness de prévia | regex corrigida |
| Logo recortada com coordenadas erradas | conferência visual | recorte refeito; a logo **continua provisória** |

## 4. Versões e compatibilidade

Nada abaixo foi confirmado no registry. "Local" é o que existe pré-instalado neste ambiente, só como indício.

| Pacote | Declarado | Local (indício) | Atenção na primeira instalação |
| --- | --- | --- | --- |
| next | `^15.0.0` | ausente | confirmar a versão 15.x resolvida; `next.config.ts` e `Metadata` são os pontos de maior risco |
| react / react-dom | `^19.0.0` | 19.2.8 | peer de `next` 15 aceita 19; conferir avisos de peer |
| tailwindcss / @tailwindcss/postcss | `^4.0.0` | 4.3.3 (só o core) | `postcss.config.mjs` usa `@tailwindcss/postcss`; conferir que a mesma minor resolve nos dois |
| typescript | `^5.9.0` | **6.0.3** | o intervalo impede o 6; se o `npm` resolver o 5.9 e o código só foi checado com o 6, rodar o typecheck de novo. `eslint-config-next`/`typescript-eslint` podem ainda não aceitar o 6 |
| eslint | `^9.0.0` | **10.1.0** | o intervalo impede o 10; `eslint-config-next` 15 foi feito para o 9 |
| eslint-config-next | `^15.0.0` | ausente | usado via `FlatCompat` em `eslint.config.mjs`; conferir que as regras carregam |
| lucide-react | `^0.462.0` | ausente (há `react-icons` 5.7.0) | confirmar nomes dos ícones; trocar o intervalo se algum nome tiver mudado |
| @supabase/ssr / supabase-js | `^0.5.0` / `^2.45.0` | ausentes | API `getAll`/`setAll` dos cookies; os intervalos repetem os do Áurea |
| clsx, server-only, @types/* | ver `package.json` | ausentes | sem risco conhecido |

Ao fechar a instalação, **atualizar esta tabela com as versões resolvidas** (as do `package-lock.json`).

## 5. Procedimento para concluir a Fase 00 em ambiente autorizado

Numa máquina (ou CI) com acesso ao registry do npm e Node ≥ 22.18, com `psql` e Postgres 16 descartável:

```bash
cd bolonha-app
npm install                 # gera o package-lock.json (versione-o depois, e só depois deste passo bem-sucedido)
npm ls --depth=0            # confira as versões resolvidas e avisos de peer; atualize a seção 4
npm run lint
npm run typecheck           # tipos REAIS: agora vale como validação
npm test                    # esperado: 15 de 15
PGHOST=localhost PGUSER=postgres DB_TEST_NAME=bolonha_test npm run test:db   # banco DESCARTÁVEL
npm run build               # confirma next/font (Archivo), Metadata, next/image, ícones
npm run dev                 # inspecionar nos navegadores a 390 e 1280 px: /, /agendar, /admin/*
```

Pontos a olhar no primeiro `build`/`typecheck`: props de `next/image` e `Metadata`/`manifest.ts`; `next/font` com `axes: ["wdth"]`; nomes de ícones do `lucide-react`; a API de cookies do `@supabase/ssr`; carregamento do `eslint.config.mjs`; `/admin` deve responder 404 em `next start` (produção). Depois: substituir a logo provisória pelo arquivo original em alta resolução e repetir a inspeção visual.

Se algum comando falhar, a correção entra **sem** novas funcionalidades e o resultado é registrado aqui. A Fase 00 passa a "tecnicamente validada" quando: instalação válida, lockfile versionado, typecheck real, lint, build, testes de domínio e SQL passarem, as telas forem inspecionadas com as dependências definitivas e a seção 4 estiver atualizada.

## 6. Arquivos

Criados na entrega inicial (em `bolonha-app/`, separado da referência): configuração (`package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.example`, `README.md`); `docs/` (5 documentos + 4 prévias); `src/app`, `src/components`, `src/config`, `src/domain`, `src/lib`; `supabase/migrations/0001_foundation.sql` e testes SQL; `tests/`; `scripts/`; `public/brand` e `public/icons`. Hoje: 71 arquivos, cerca de 2.500 linhas de texto.

Alterados na rodada de 14/10:
- `supabase/migrations/0001_foundation.sql` (reestruturada: privilégios padrão antes das funções; helpers `local_date`/`local_today`; `btree_gist` no schema `extensions`);
- `supabase/tests/0001_foundation.test.sql` (ampliado) e **novo** `supabase/tests/0002_security_guards.test.sql`;
- `src/domain/phone.ts` (sem helper de SMS), `tests/phone.test.ts`, `src/config/booking-steps.ts`, `.env.example`, `src/lib/supabase/admin.ts` (comentário), `src/app/(admin)/admin/layout.tsx` (404 em produção sem login), `src/app/globals.css`;
- `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/PHASE_00_REPORT.md`, `docs/DESIGN_SYSTEM.md` (legenda das prévias), `README.md`, `docs/assets/*.png`.

Não alterados: arquivos do Áurea (`/home/claude/reference/aurea-src/`). Não criados: projeto Supabase, `package-lock.json`, deploy, credenciais reais.

## 7. Pendências e riscos restantes

Bloqueantes para validar a Fase 00: itens B1 a B9 e B11 (seção 2), todos dependentes de acesso ao registry.

Do proprietário/cliente:
1. **Logo original em alta resolução**: a atual é recorte de captura de tela (provisória; não foi redesenhada).
2. **Moodboard**: não foi localizado entre os arquivos; nenhuma referência foi inventada. Isso não bloqueia a validação técnica.
3. Confirmar endereço, telefone e horários (vêm de capturas do Instagram); fotos reais de barbeiros e serviços/preços.
4. Aprovar o desenho de identidade do cliente sem SMS (`ARCHITECTURE.md`, 4.2) antes da Fase 03, e escolher a recuperação de senha da equipe (4.1) na Fase 01.

Riscos técnicos:
- Primeira vez que o código vê os pacotes reais (ver pontos de atenção na seção 5): pode haver erros de tipo/lint/build ainda invisíveis.
- Possível descompasso de versões (TypeScript 6 e ESLint 10 locais vs. intervalos declarados).
- ACLs padrão de funções e RLS **não** verificadas no Supabase real (a prova atual usa roles simulados; repetir `0002` em staging).
- Teste de concorrência ainda não versionado (entra na Fase 02, sobre a tabela real).
- Sem verificação de posse do telefone: aceita-se reserva com telefone de terceiros; mitigada pelas travas propostas, não eliminada.
- Telefone: a validação precisará existir também em SQL (testar TS e SQL).
- LGPD sem texto e política; limite do SMTP padrão do Supabase não verificado.

## 8. Critérios de aceite da Fase 00

| Critério | Estado |
| --- | --- |
| Referência Áurea documentada tecnicamente | ✅ `REFERENCE_AUDIT.md` |
| Novo projeto separado da referência | ✅ |
| Arquitetura e roadmap documentados e coerentes com "sem SMS" | ✅ |
| Design system definido | ✅ (logo provisória; moodboard não localizado) |
| Estrutura inicial coerente | 🟡 conferida por testes de domínio/SQL e render; **não** por typecheck/lint/build reais |
| Dependências instaladas, lockfile versionado | ⛔ bloqueado (rede) |
| Typecheck real, lint, build de produção | ⛔ bloqueado (rede) |
| Testes de domínio e SQL | ✅ 15 de 15; 2 de 2 arquivos |
| Telas inspecionadas com dependências definitivas | ⛔ bloqueado (rede); prévia indicativa feita |
| Pendências e riscos documentados | ✅ |

## 9. Recomendação sobre a Fase 01

**Não liberar a Fase 01 ainda.** Ela é a primeira a escrever código que depende de `@supabase/ssr`, de middleware e do build do Next; fazê-lo sobre uma base que nunca compilou acumula risco. O caminho curto: executar a seção 5 em um ambiente com acesso ao registry (minutos de trabalho), corrigir o que aparecer sem criar funcionalidades, atualizar este relatório e então iniciar a Fase 01. A decisão de não usar SMS **não** bloqueia a Fase 01: ela usa e-mail + senha. A pendência da identidade do cliente só precisa ser decidida antes da Fase 03.
