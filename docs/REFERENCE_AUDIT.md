# Auditoria técnica da referência (projeto Áurea)

Data: 12/10/2026. Escopo: o ZIP `aurea-projeto-completo-rodada-0013.zip`, usado **somente** como referência de engenharia. O original foi extraído em `reference/aurea-src/` (fora do Bolonha App) e não foi modificado. Nada da identidade visual do Áurea foi reaproveitado.

Cada afirmação abaixo vem marcada com o que realmente aconteceu:

- **[Lido]** li o arquivo; nada foi executado.
- **[Executado]** rodei e observei o resultado.
- **[Não verificado]** não li ou não consegui executar.

## 1. Resumo

O Áurea é um SaaS multiempresa de agenda e financeiro para profissionais de beleza (`package.json`: nome `aurea`, versão 0.4.0; a pasta interna ainda se chama `hive-beauty`). Sua parte mais valiosa é o **banco**: 13 migrações com RLS, uma exclusion constraint contra reservas sobrepostas, RPCs `SECURITY DEFINER` com checagem manual de papel, índice único contra pagamento duplicado e auditoria por trigger. Sua parte menos aproveitável para o Bolonha é a **camada de aplicação**: tudo exige login, o agendamento é feito direto do navegador e não existe nenhuma superfície pública, verificação de telefone ou motor de disponibilidade no servidor.

## 2. Estrutura e dependências

[Lido] 133 arquivos. Next.js App Router com rotas `(app)`, `(auth)`, `(superadmin)` e `onboarding`; `components/ui` com 14 componentes; `lib/hive/*` com lógica pura; `supabase/` com `migrations`, `tests`, `diagnostics` e `seed.sql`; `tests/*.test.cjs`.

| Item | Valor encontrado |
| --- | --- |
| Next / React | `^14.2.0` / `^18.3.0` |
| Supabase | `@supabase/supabase-js ^2.45.0`, `@supabase/ssr ^0.5.0` |
| Estilo / ícones / datas | Tailwind `^3.4.0`, `lucide-react ^0.462.0`, `date-fns ^3.6.0` |
| TypeScript | `^5.5.0` |
| Lockfile | **ausente** (resolução de versões não reproduzível) |
| `.gitignore`, config de ESLint, CI | **ausentes** (`next lint` pediria configuração interativa) |
| Service worker | **ausente** (só `manifest.json`) |

Observação [Lido]: `lib/supabase/server.ts` usa `await cookies()`, API do Next 15, enquanto o `package.json` fixa Next 14. Funciona no 14 (`await` de valor síncrono), mas indica deriva de versão.

## 3. Autenticação e permissões

- [Lido] `middleware.ts` renova a sessão com `@supabase/ssr` e redireciona qualquer rota não pública para `/login`. O matcher exclui estáticos e `/api`.
- [Lido] Papéis `owner`, `admin`, `professional`, `reception` em `company_members`; funções `is_company_member`, `is_company_admin`, `member_role_in`, `is_superadmin` (`SECURITY DEFINER`, `search_path` fixado).
- [Lido] A chave de service role aparece só em `lib/supabase/admin.ts` (`server-only`) e em `app/(superadmin)/admin/page.tsx`. O guard `requireSuperadmin()` falha fechado.
- [Executado] Com um usuário `professional` sob RLS, **inserir um agendamento fora de qualquer expediente, com duração de 10 h, preço 0 e em nome de outro profissional foi aceito** (a policy `appointments_all` só exige ser membro).
- [Executado] Com o mesmo usuário, **alterar preço e cancelar o agendamento de outro profissional foi aceito**. O comentário da migração 0001 diz que as permissões finas ficariam para depois; para `appointments` e `clients` nunca foram refinadas.
- [Executado, com ressalva] Em um Postgres com roles de teste que imitam os privilégios padrão do Supabase, `anon` tinha EXECUTE em `get_company_member_names` e `create_company_with_owner`. As migrações mais novas revogam de `anon`; as antigas só de `public`. **Confirmar no projeto Supabase real**, porque a minha simulação é uma aproximação.

## 4. Agendamento e conflitos

- [Executado] A exclusion constraint `no_overlap_per_professional` (`gist`, `professional_member_id WITH =`, `tstzrange(...) WITH &&`, ignorando `cancelado` e `nao_compareceu`) **barra a sobreposição** (erro `23P01`). É o padrão certo e será reaproveitado.
- [Lido] Os horários livres são calculados **no navegador** (`lib/hive/schedule.ts`): lê `business_hours`, `blocked_times` e `appointments` e monta os slots com `new Date("${data}T00:00:00")`, ou seja, no fuso do aparelho. O próprio código declara que isso é "só um aviso antecipado".
- [Lido] O INSERT também vem do navegador, com `scheduled_end`, `price` e `duration` calculados no cliente. Nada no servidor confere se o serviço dura aquilo, se o horário está dentro do expediente ou se há bloqueio. A única garantia server-side é a constraint de sobreposição.
- Consequência para o Bolonha: com agendamento **público** e anônimo, esse modelo é inaceitável. O Bolonha precisa de uma RPC transacional que derive término e preço do serviço, valide expediente, intervalos e bloqueios e só então insira, deixando a constraint como última defesa.

## 5. Financeiro e integridade transacional

- [Lido] `conclude_appointment` é `SECURITY DEFINER`, valida usuário, membership, papel e se o atendimento é do profissional, e faz `SELECT ... FOR UPDATE` antes de checar o status (0010). O pagamento só nasce nessa RPC.
- [Lido] Índice único parcial `payments_appointment_id_unique` (um pagamento por atendimento) e `CHECK`s `payments_paid_amount_bounds` e `payments_status_consistency`, mais trigger de normalização. Boa defesa em profundidade.
- [Lido] Fuso: a migração 0006 corrige cálculos que usavam UTC (depois de ~21 h em Brasília o "dia" já era o seguinte). O Bolonha deve **nascer** com isso resolvido (ver `0001_foundation.sql`).
- Limitações [Lido]:
  1. **Não há razão de pagamentos.** Um atendimento tem uma linha com `status` (`pago`, `pendente`, `parcial`) e `paid_amount`. Dois recebimentos parciais em dias diferentes não deixam rastro, e `get_period_indicators` atribui o "recebido" ao dia de **criação** da linha (`created_at`), não ao dia em que o dinheiro entrou. O requisito do Bolonha de separar faturamento, recebido, pendente e despesas exige um modelo de lançamentos.
  2. `delete_appointment` **apaga** o pagamento; o único rastro é o `audit_logs`. Para um sistema financeiro, o correto é estorno/anulação com histórico.
  3. Comissões não existem.
  4. Comentário de `0012` cita `payments_paid_amount_consistency`, mas a constraint se chama `payments_status_consistency` (deriva só de comentário).

## 6. Testes e limitações conhecidas

- [Executado] `npm test` na cópia (Node 22 com o TypeScript global): **52 de 52 testes passaram**. Cobrem apenas lógica pura (telefone, datas, segmentos, mensagens, fluxo de atendimento).
- [Executado] As migrações 0001 a 0013, aplicadas em ordem num Postgres 16 limpo com um stub de `auth`/roles, **rodaram sem erro**. Não prova que rodam no Supabase real.
- [Não executado] Os três scripts `supabase/tests/*_staging.sql` são manuais (colar no SQL Editor, exigem usuário em `auth.users`). Li só o cabeçalho de um deles.
- Regra de telefone **duplicada** em SQL (`normalize_br_phone`) e TS (`lib/hive/phone.ts`) e mantida em sincronia à mão; só o lado TS tem teste automatizado.
- Não há testes de UI, de RLS automatizados nem CI.

## 7. O que reaproveitar, adaptar ou evitar

| Padrão do Áurea | Decisão no Bolonha |
| --- | --- |
| Exclusion constraint `gist` por profissional | **Reaproveitar** (em `tstzrange` por barbeiro, `[)`) |
| Trava `FOR UPDATE` + índice único contra duplicidade | **Reaproveitar** (e estender para idempotência por chave) |
| RPC `SECURITY DEFINER` com `search_path = public, pg_temp` e checagem manual de papel | **Reaproveitar**, sempre com `REVOKE`/`GRANT` explícitos |
| Triggers de auditoria | **Adaptar**: também registrar o ator em eventos de agendamento e financeiro |
| Estado derivado por coluna gerada (`phone_normalized`) | **Adaptar** (E.164, e testes em SQL e TS) |
| `NOTIFY pgrst, 'reload schema'` ao fim de migrações | **Reaproveitar** |
| Multi-tenant (`company_id`, FK composta, `is_company_member`) | **Descartar** (decisão aprovada: sem multiempresa) |
| Superadmin e plano SaaS | **Descartar** |
| Slots calculados no navegador e INSERT direto | **Descartar**: disponibilidade e reserva no servidor/banco |
| Pagamento em uma linha com `paid_amount` | **Descartar**: razão de lançamentos com estorno |
| `delete_appointment` apagando pagamento | **Descartar** |
| Policies amplas "qualquer membro escreve" | **Descartar**: deny by default |
| Confirmação por link `wa.me` | **Descartar** (sem WhatsApp na v1) |
| Funções novas executáveis por padrão | **Corrigir** (`0001_foundation.sql` inverte para negar por padrão) |

## 8. O que não foi examinado

Não li a maior parte dos componentes e páginas (`components/*`, `app/(app)/*`), `tailwind.config.ts`, os demais arquivos de `lib/hive`, os scripts de staging `0009`/`0012`, `supabase/diagnostics`, a migração `0007` (contato da empresa; só foi aplicada no teste de ordem) nem o `seed.sql` (só as primeiras linhas). Não rodei `npm install`, `lint` nem `build` do Áurea: o ambiente não alcança o registry do npm. Nada disso muda as conclusões acima, mas elas valem apenas para o que foi lido e executado.
