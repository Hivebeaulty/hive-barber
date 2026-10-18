# Arquitetura do Bolonha App

Estado: **proposta da Fase 00, ajustada em 17/10/2026 para a estratégia white-label** (ver `WHITE_LABEL.md`; numeração de fases em `ROADMAP.md`). O que já existe no repositório está marcado como *(existe)*; o restante é desenho para as próximas fases. Decisões abertas estão na seção 13.

**Decisão de produto definitiva (14/10/2026): o sistema não usa SMS.** Nenhum provedor de SMS, nenhum custo por mensagem e nenhuma dependência arquitetural de SMS em qualquer fase. A autenticação da equipe é e-mail + senha; o cliente se identifica sem verificação por código (seção 4).

## 1. Princípios

1. **Uma barbearia por implantação, sobre a mesma base de código.** Sem multiempresa, sem superadmin, sem planos (por enquanto). O produto é **white-label**: a Bolonha é o piloto; outra barbearia = nova implantação (projeto Supabase e projeto Vercel próprios, mesmas migrações, variáveis próprias), com identidade e dados em **configuração**, não em código. Decisão e justificativa: `WHITE_LABEL.md`.
2. **O banco é a autoridade.** Disponibilidade, reserva, cancelamento e financeiro são validados no servidor **e** garantidos por constraints/RLS. A interface só apresenta.
3. **Negar por padrão.** Nenhuma tabela é legível por `anon`. O catálogo público sai por views/RPCs com colunas escolhidas. Funções novas não são executáveis por `anon`/`public` *(existe: `0001_foundation.sql`)*.
4. **Dinheiro é lançamento, não flag.** Cobrança e recebimento são coisas diferentes; nada é apagado, só estornado.
5. **Fuso do negócio em um lugar só** (`America/Sao_Paulo`): `app_timezone()`, `local_date()` *(existem)*.
6. **Credenciais privilegiadas nunca chegam ao navegador** (`server-only`).

## 2. Stack

| Camada | Escolha | Justificativa |
| --- | --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript estrito | Server Components/Actions mantêm lógica sensível no servidor; mesma base do Áurea, em versão atual. |
| Estilo | Tailwind CSS 4 (`@theme` em CSS) | Tokens em um arquivo (`globals.css`), útil para cópias do produto. |
| Banco/Auth | Supabase (Postgres + Auth + Storage) com RLS | Já indicado no briefing; RLS é a camada de defesa. |
| Hospedagem | Vercel (app) + Supabase (dados) | Idem. |
| Ícones | `lucide-react` | Conjunto consistente; única dependência de UI além do Tailwind. |
| Testes | `node:test` com type stripping (Node ≥ 22.18) + testes SQL | Zero dependência para a lógica de domínio. Playwright entra na Fase 08. |

Versões: `package.json` usa intervalos de major (`next ^15`, `tailwindcss ^4`, etc.). **Não foi possível consultar o registry** nas duas sessões (DNS do npm bloqueado); os majors foram escolhidos por conhecimento e **precisam ser confirmados no primeiro `npm install` em ambiente autorizado**, que gera o `package-lock.json` (commitá-lo; ele não existe ainda de propósito). Tabela de compatibilidade a conferir em `PHASE_00_REPORT.md`, seção 4. Next 16 deve ser avaliado antes da Fase 08.

Não adicionadas de propósito: biblioteca de formulários, de estado global, de datas, ORM, `zod` (entra na Fase 02 quando houver formulários reais) e serviço de e-mail transacional (só se a necessidade for comprovada; ver seção 4). Sem SMS, por decisão de produto.

## 3. Estrutura de diretórios *(existe, exceto o marcado)*

```
bolonha-app/
├─ docs/                      auditoria, arquitetura, roadmap, design system
├─ public/
│  ├─ brand/                  logo oficial (provisória, ver brand.ts)
│  └─ icons/                  ícones do PWA (escala proporcional da logo)
├─ scripts/                   db-test.sh, contrast.mjs
├─ src/
│  ├─ app/
│  │  ├─ (public)/            site e agendamento do cliente
│  │  ├─ (admin)/admin/       painel (estrutura; sem login ainda)
│  │  ├─ layout.tsx, manifest.ts, globals.css, error.tsx, not-found.tsx
│  │  └─ (api)/ ...           Route Handlers (Fase 04: reserva, acesso por link)   [futuro]
│  ├─ components/{ui,brand,site,admin}/
│  ├─ config/                 marca, dados do negócio, flags, navegação
│  ├─ domain/                 regras PURAS e testáveis (sem React, sem Supabase)
│  └─ lib/{env.ts,cn.ts,supabase/}
├─ supabase/
│  ├─ migrations/             SQL versionado, ordem numérica
│  └─ tests/                  testes SQL + stub do Supabase para Postgres puro
└─ tests/                     testes de domínio (node:test)
```

Regra de dependência: `domain` não importa nada de fora; `components` pode importar `domain` e `config`; só `lib/supabase/*` conhece o Supabase. Arquivos de `domain` e `lib` usam imports relativos com extensão `.ts` (necessário para rodar os testes sem bundler).

## 4. Autenticação e identidade

**Sem SMS, sem WhatsApp como substituto e sem provedor externo pago.** Dois públicos, dois mecanismos.

### 4.1 Equipe (proprietário e barbeiros): e-mail e senha no Supabase Auth

- Cadastro público **desligado** no projeto Supabase. Quem entra na equipe é criado/convidado pelo proprietário, do lado do servidor (`admin.ts`, service role): ninguém vira equipe sozinho.
- O papel vem da tabela `staff_profiles` (ligada a `auth.users`), nunca de `user_metadata` (editável pelo próprio usuário). Rotas `/admin/**` exigem sessão **e** perfil ativo, checados no servidor a cada requisição (`getUser()`, não `getSession()`).
- Sessão por cookies (`@supabase/ssr`) com renovação em middleware (Fase 02).
- **Recuperação de senha, opções avaliadas** (a escolher na Fase 02; nenhuma exige SMS):
  1. *Redefinição por e-mail* (`resetPasswordForEmail`): é o caminho padrão e sem custo por mensagem. Ressalva: o SMTP embutido do Supabase é restrito a fins de teste e tem limite baixo de envios (não verificado nesta sessão; confirmar na documentação vigente). Para uso real pode ser necessário um SMTP próprio; a equipe é pequena e o volume é desprezível, então um plano gratuito de qualquer provedor SMTP tende a bastar. **Isso só entra se for comprovadamente necessário**, e é uma decisão do proprietário.
  2. *Redefinição pelo proprietário*: o proprietário gera uma senha temporária para o barbeiro (ação de servidor) e o sistema força a troca no próximo login. Zero dependência externa.
  3. *Recuperação do proprietário (quebra-vidro)*: pelo painel do Supabase, com o e-mail do administrador do projeto.
  Proposta inicial: 2 + 3 desde o dia 1; 1 quando houver SMTP configurado.
- **Evolução sem refazer:** o código fala com uma abstração de "ator autenticado" (`getStaffActor()`), então 2FA por TOTP ou link mágico por e-mail podem ser adicionados depois sem mexer em RLS nem nas telas.

### 4.2 Cliente: telefone como contato, não como prova de identidade *(proposta A, aguarda aprovação)*

O briefing pede reserva sem senha. Sem SMS não há como *provar* a posse do número, e o desenho assume isso em vez de fingir o contrário:

- O telefone (E.164, normalizado por `src/domain/phone.ts`) é um **dado de contato não verificado**, usado pela barbearia para falar com o cliente.
- **Quem reservou controla a reserva** por um segredo de alta entropia (≥ 128 bits) gerado no servidor na criação do agendamento: só o **hash** fica no banco (`appointments.access_token_hash`); o segredo vai para um cookie `httpOnly` do aparelho e para um **link de gerenciamento** que o cliente pode salvar. "Minhas reservas" lista as reservas do aparelho; cancelar exige o segredo. Saber o telefone de alguém **não** dá acesso à reserva dele.
- **Antiabuso sem verificação** (custo zero): limite de reservas futuras ativas por telefone e por aparelho; limite de taxa por IP e global registrado no banco; campo-isca (honeypot); o proprietário pode **bloquear um número**; cancelamento do cliente segue o prazo de 2 h e vale só com o segredo.
- Trade-off aceito e declarado: alguém pode reservar usando o telefone de outra pessoa (a barbearia vê o telefone e pode confirmar por ligação, se quiser). O risco é de incômodo, não de vazamento de dados.
- **Opcional futuro, sem SMS:** link mágico por e-mail (Supabase Auth) para quem quiser ver reservas em outro aparelho. Não é requisito e não bloqueia fase alguma.
- O que **depende** de verificação de posse do número e por isso muda: apenas o critério da Fase 04 "telefone verificado antes de reservar", que foi **substituído** pelo desenho acima. Nenhuma outra regra aprovada depende de SMS (conferido regra a regra nesta rodada).

## 5. Papéis e permissões

Papéis: `owner`, `barber` (equipe) e cliente (sem perfil de equipe).

| Ação | owner | barber | cliente |
| --- | --- | --- | --- |
| Ver catálogo e profissionais | sim | sim | sim (público) |
| Ver agenda | todas | só a própria | só as próprias reservas (por segredo do aparelho/link) |
| Criar/editar/cancelar agendamento | qualquer | só os próprios* | criar e cancelar as próprias (até 2 h antes) |
| Cancelar após o prazo | sim | não | não |
| Configurar jornada, intervalos, folgas | de todos | só a própria | não |
| Cadastrar serviços e profissionais | sim | não | não |
| Registrar atendimento concluído / falta | qualquer | só os próprios | não |
| Financeiro (receitas, despesas, caixa) | sim | **não** | não |
| Ganhos e comissão | todos | só os próprios | não |

\* Hipótese a confirmar: o briefing diz que o proprietário ajusta a agenda de todos; assumimos que o barbeiro age apenas sobre a própria. Ver seção 13.

Esconder item de menu **não** é controle de acesso. Cada tabela tem policy própria e cada RPC checa o papel.

## 6. Migrações

- Arquivos `supabase/migrations/NNNN_descricao.sql`, ordem numérica, **imutáveis depois de aplicadas**: correções entram como nova migração.
- Cada migração: comentário de propósito, aborta cedo (`raise exception`) se a pré-condição falhar, termina com `notify pgrst, 'reload schema'` quando muda esquema exposto.
- Valores novos de `enum` ficam sozinhos em um arquivo (o Postgres não deixa usar o valor na mesma transação).
- Teste obrigatório: `npm run test:db` aplica tudo em banco descartável (Postgres puro + stub) *(existe)*; antes de produção, repetir em um projeto Supabase de **staging**.
- Aplicação em produção só com autorização explícita (`supabase db push`), nunca automática no deploy.

## 7. Modelo inicial de dados (desenho; implementado a partir da Fase 02)

```
business_settings (1 linha)  nome, endereço, telefone, política de cancelamento (horas)
booking_attempts             chave (telefone|aparelho|ip), janela, contagem   (antiabuso, sem SMS)
staff_profiles               user_id → auth.users, role (owner|barber), display_name, active
barbers                      id, staff_profile_id?, name, photo_path, bio, active, sort_order
service_categories           id, name, sort_order
services                     id, category_id, name, duration_minutes (fixa), price_cents, active
barber_services              barber_id, service_id           (quem executa o quê)
working_hours                barber_id, weekday, start_time, end_time   (várias faixas/dia = intervalos)
schedule_blocks              barber_id, tstzrange, kind (break|time_off|vacation|other), reason
customers                    id, name, phone_e164 (único, NÃO verificado), blocked, created_at   (sem auth_user_id: cliente não tem conta)
appointments                 id, customer_id, barber_id, service_id, starts_at, ends_at,
                             price_cents_snapshot, duration_snapshot, status
                             (confirmed|completed|cancelled|no_show), cancelled_by, cancelled_at,
                             idempotency_key (único), access_token_hash, created_by
appointment_events           appointment_id, event, actor, at, detail   (trilha imutável)
charges                      id, appointment_id (único) ou avulsa, amount_cents, status
payments                     id, charge_id, amount_cents, method, received_at, reverses_payment_id?
expenses / expense_categories
commission_rules             barber_id?, service_id?, percent | fixed, vigência
commission_entries           appointment_id, barber_id, base_cents, amount_cents, status
audit_log                    ator, ação, entidade, antes/depois (só leitura para o owner)
```

Convenções: dinheiro em **centavos inteiros**; `timestamptz` em UTC e datas locais sempre via `local_date()`; preço e duração **copiados** para o agendamento (editar o serviço depois não reescreve o passado).

## 8. Estratégia de agenda

- **Fonte única da disponibilidade:** função SQL `available_slots(barber, service, dia)` calculada no fuso do negócio, usada tanto pela tela quanto pela reserva. A interface nunca recalcula por conta própria.
- Subtrai de cada faixa de `working_hours`: `schedule_blocks`, agendamentos `confirmed`/`completed` do barbeiro e horários já passados (mais antecedência mínima, se adotada).
- **Reserva = uma RPC transacional** `book_appointment(...)`: valida a entrada (telefone, antiabuso), trava o barbeiro (`FOR UPDATE` ou advisory lock), confere que o barbeiro executa o serviço, **deriva** término e preço do cadastro (o cliente nunca os envia), revalida o slot e insere. Falha limpa se o horário foi tomado.
- **Garantia final no banco:** `EXCLUDE USING gist (barber_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&) WHERE (status IN ('confirmed','completed'))` (padrão validado no Áurea; `btree_gist` já habilitada).
- Cancelar libera o horário; **idempotência** por `idempotency_key` evita reserva dupla em duplo toque/reenvio.
- Cancelamento do cliente: RPC valida `starts_at - now() >= 2 h` no servidor (regra espelhada em `src/domain/cancellation.ts` *(existe, testada)*). O proprietário cancela sem prazo.

## 9. Segurança e RLS

- RLS ligada em **todas** as tabelas; sem policy = sem acesso. Nenhuma tabela concede acesso a `anon`.
- Catálogo público por `view`/RPC com colunas explícitas (nome, preço, duração, foto do barbeiro). Nunca expor telefone ou dados de cliente.
- Funções auxiliares `is_owner()`, `is_staff()`, `current_barber_id()` (`SECURITY DEFINER`, `search_path = public, pg_temp`, `STABLE`).
- Financeiro: tabelas owner-only; o barbeiro lê ganhos próprios por uma RPC/view que filtra por `current_barber_id()`.
- Toda RPC `SECURITY DEFINER`: valida autenticação e papel **antes** de tocar em dados, `REVOKE ... FROM public, anon` e `GRANT` explícito *(padrão já imposto pelo default privileges de `0001`)*.
- Antiabuso da reserva pública sem SMS: limites por telefone, aparelho e IP gravados no banco, teto de reservas futuras ativas, honeypot e bloqueio de número pelo proprietário (seção 4.2).
- Segredo de acesso do cliente: só o hash é armazenado; comparação em tempo constante; o segredo nunca aparece em log.
- Cadastro público de usuários desligado no Supabase (a equipe é criada pelo servidor).
- Cabeçalhos de segurança básicos em `next.config.ts` *(existem)*; CSP na Fase 08.
- Service role só em `src/lib/supabase/admin.ts` (`server-only`).
- **LGPD:** coletamos nome e telefone; precisamos de aviso de privacidade, base legal, retenção e exclusão (decisões abertas).
- Pendência de verificação: confirmar no Supabase real as ACLs padrão de funções e a ausência de funções executáveis por `anon` (a prova atual é com roles simulados; os testes `0002_security_guards` devem ser repetidos em staging).

### 9.1 Matriz de garantias exigidas × desenho × evidência

Na Fase 00 **não existem tabelas de negócio**; o que há é a fundação e a prova do padrão. A coluna "Evidência" separa o que foi executado do que depende de tabelas futuras ou do Supabase real.

| Garantia | Desenho | Evidência hoje | Falta provar |
| --- | --- | --- | --- |
| Acesso admin só a autorizados | Sessão + `staff_profiles.active` no servidor; `/admin` dá 404 em produção até existir login; RLS em tudo | `notFound()` escrito; guarda SQL "nenhuma tabela pública sem RLS" **passa** (hoje vazio) | Login e RLS reais (Fase 02), em staging |
| Separação owner × barbeiro | `is_owner()`/`current_barber_id()` nas policies; financeiro só owner | Só desenho | Testes SQL por papel (Fases 02 e 06) |
| Sem sobreposição, inclusive concorrente | `EXCLUDE USING gist (barber_id =, tstzrange &&)` + trava na RPC | **Provado do padrão**, em execução avulsa (não versionada) numa tabela descartável: 25 inserções simultâneas, exatamente 1 vence; transação bloqueada falha com `23P01` após o commit da primeira | Versionar o teste de concorrência e rodá-lo sobre a tabela real (Fase 03) |
| Horário de funcionamento e disponibilidade do profissional | `available_slots()` única, validada de novo dentro de `book_appointment` | Sondas no Áurea reproduziram o defeito do modelo antigo (reserva fora do expediente) | Implementar e testar (Fase 03) |
| Preço e duração confiáveis | Término e preço **derivados** de `services` na RPC e copiados (*snapshot*) | Só desenho | Teste de que o cliente não consegue informá-los (Fase 04) |
| Cancelamento sujeito às regras | Prazo de 2 h no servidor; owner sem prazo | Regra pura **testada** (`cancellation.test.ts`, limite inclusivo) | Mesma regra dentro da RPC (Fase 04) |
| Histórico de recebimentos, ajustes e estornos | `charges`/`payments` com `reverses_payment_id`; sem `DELETE` | Só desenho; Áurea auditado (apaga pagamentos) | Testes de integridade (Fase 06) |
| Negar por padrão | Default privileges revogados; `anon` sem tabelas; funções com `GRANT` explícito | **Provado** em Postgres descartável: guarda `0002` (funções executáveis por `anon` = só 3 helpers; tabela sem RLS é detectada; auto-teste do detector) | Repetir no Supabase real (ACLs padrão da plataforma) |

## 10. Testes

| Nível | Ferramenta | Cobre | Estado |
| --- | --- | --- | --- |
| Domínio | `node:test` + type stripping | cancelamento, telefone, e depois disponibilidade, comissão, caixa | existe (15 testes, passando) |
| Banco | SQL em Postgres descartável | constraints, RLS, RPCs, privilégios | existe (migração base + guardas de segurança; 2 arquivos, passando) |
| RLS/staging | mesmos testes em projeto Supabase de staging | comportamento real do PostgREST | pendente |
| Integração | Route Handlers/Actions contra staging | reserva, acesso por link, cancelamento | Fase 04 |
| E2E | Playwright (mobile + desktop) | fluxo de agendamento e painel | Fase 08 |
| Concorrência | script que dispara N reservas simultâneas do mesmo slot | exatamente 1 vence | Fase 03 |
| Visual | Playwright (Chromium e WebKit) tirando capturas no CI | home, agendar e painel a 390 e 1280 px | Fase 01 (evidência; não substitui aparelho real) |

Critério de pronto de cada fase: testes da fase escritos **e executados**, resultado registrado no relatório da fase.

## 11. PWA

Agora: `manifest.ts` e ícones *(existem)*. Fase 08: service worker que faz cache apenas do *app shell* e de estáticos; **nunca** de respostas autenticadas, de disponibilidade ou de reserva. Página offline informativa. Verificar critérios de instalação em Android/iOS reais. Notificações push ficam fora da v1.

## 12. Deploy e variáveis de ambiente

Ambientes: `local`, `staging` (projeto Supabase + preview da Vercel) e `production`. Nada é publicado ou migrado sem autorização.

| Variável | Escopo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | pública | URL base (metadata, links) |
| `NEXT_PUBLIC_SUPABASE_URL` | pública | endpoint do projeto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `..._ANON_KEY`) | pública | chave pública; segurança vem do RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **servidor** | ignora RLS; só em `admin.ts` |
| `APP_TIMEZONE` | servidor | fuso do negócio (`America/Sao_Paulo`) |

Fluxo: PR → CI (lint, typecheck, test, test:db) → preview → migrações em staging → produção, com aprovação humana.

## 13. Decisões e ambiguidades para as próximas fases

Propostas mais seguras já indicadas; **nada disso altera requisito aprovado**.

1. ~~Provedor de SMS~~ — **encerrada**: o produto não usa SMS (decisão definitiva). Não bloqueia nenhuma fase.
2. **Recuperação de senha da equipe** (seção 4.1): confirmar a proposta 2 + 3 e se haverá SMTP próprio. Decide-se na Fase 02; não bloqueia a Fase 00.
3. **Identidade do cliente sem verificação** (seção 4.2, proposta A): aprovar o desenho (segredo por aparelho/link, antiabuso, aceitar reservas com telefone não verificado). Decide-se antes da Fase 04; não bloqueia as Fases 01 e 02. Também: telefone só celular ou aceita fixo? Um cliente por telefone, com nomes adicionais no agendamento?
4. **Granularidade do slot** (proposta: 15 min), **antecedência mínima** (ex.: 30 min), **horizonte máximo** (ex.: 30 dias), **intervalo entre atendimentos**.
5. **Barbeiro e agenda alheia:** pode ver a agenda dos colegas? (proposta: só a própria; o proprietário vê tudo).
6. **Cancelamento do cliente depois do prazo:** mensagem orienta a ligar (já no domínio). Cobrar falta? Fora do escopo da v1.
7. **Atendimento sem agendamento (encaixe):** permitir ao proprietário/barbeiro registrar.
8. **Comissão:** percentual sobre preço do serviço ou sobre o recebido (líquido de taxa de cartão)? Por barbeiro ou por serviço? Vigência.
9. **Formas de pagamento** a registrar (Pix, dinheiro, débito, crédito?).
10. **Fotos dos barbeiros:** Supabase Storage com leitura pública para fotos e escrita restrita.
11. **Dados reais:** confirmar endereço, telefone e horários (hoje vindos de captura de tela do Instagram) e enviar a **logo original** em alta resolução.
12. **LGPD:** texto de privacidade, retenção, exclusão a pedido.
13. **Domínio próprio** e URL pública do app.
14. **Next 16** vs 15 (reavaliar antes da Fase 08).
15. **White-label** (`WHITE_LABEL.md`, seção 7): D1 modelo de implantação, D2 fuso por implantação, D3 versionamento de migrações, D4 identidade no banco, D5 papéis, D6 escopo Brasil, D7 nome do produto, D8 multiunidade, D9 LGPD, D10 custo por implantação.
16. **Direção visual** não aprovada (`VISUAL_AUDIT.md`): escolher entre as direções A e B antes de novas telas.

## 14. White-label: o que muda na arquitetura (resumo)

Detalhes, tabelas e decisões: `WHITE_LABEL.md`.

- **Camadas separadas:** núcleo do produto (repositório) · identidade (banco e Storage, com padrões neutros no código) · dados operacionais (banco) · configuração da implantação (variáveis de ambiente) · usuários e permissões.
- **Hoje, acoplado à Bolonha:** `src/config/brand.ts`, `business.ts`, `globals.css`, `public/brand/`, `manifest.ts`, textos de `metadata` e do painel, nomes de tokens (`carvao`, `azul`, `madeira`), 3 arquivos com hex solto, fuso fixo no SQL (`APP_TIMEZONE` não é lida por nada).
- **Agora (Fase 01):** tokens semânticos, `getShop()` com padrões neutros, *seed* da Bolonha como dados, fuso por implantação (migração nova), versionamento de migrações compatível com a CLI do Supabase, nome neutro do produto.
- **Depois (só com necessidade comercial):** multiempresa (`shop_id`, políticas reescritas, testes de isolamento), domínio por host na mesma instância, painel de operador.
- **Regras de modelagem desde a Fase 02:** UUIDs, restrições nomeadas, políticas que só chamam funções auxiliares (`is_owner()`…), nada de "existe só uma barbearia" fora de `getShop()`.
