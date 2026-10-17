# Roadmap

Regra: **não avançar de fase sem validar a atual.** Cada fase termina com: tarefas concluídas, critérios de aceite verificados, testes escritos *e executados*, documentação atualizada e relatório com pendências. Uma fase por vez, em alterações pequenas e revisáveis.

Legenda de estado: ✅ entregue e validado · 🟡 entregue com pendências · ⬜ não iniciada.

## Fase 00 — Auditoria, fundação e design system 🟡

Entregue: auditoria do Áurea, arquitetura, roadmap, design system, projeto Next.js/Tailwind/Supabase estruturado, migração base com testes, domínio com testes, primeira entrega visual.

Estado (14/10/2026): **não declarada tecnicamente validada**. Passaram: testes de domínio, testes SQL (inclusive guardas de segurança e concorrência), tipos do domínio. **Bloqueados por rede** (sem registry npm): `npm install`, `lint`, `typecheck` com tipos reais, `build`, `package-lock.json`. Também pendentes: logo original em alta resolução (a atual é provisória), moodboard (não localizado), dados reais do negócio. Procedimento para fechar em ambiente autorizado: `PHASE_00_REPORT.md`, seção 5.

Decisão de produto: **sem SMS** em qualquer fase; não há provedor de SMS a escolher.

## Fase 01 — Autenticação, perfis, profissionais, serviços e configurações ⬜

Tarefas, em ordem:
1. Pré-requisito: Fase 00 fechada (`npm install`, lockfile, `lint`/`typecheck`/`build` verdes em ambiente com acesso ao registry).
2. Projeto Supabase de **staging** (com autorização) e migrações aplicadas.
3. Tabelas: `staff_profiles`, `business_settings`, `barbers`, `service_categories`, `services`, `barber_services` + RLS + testes SQL.
4. Login da equipe por **e-mail e senha** (Supabase Auth, cadastro público desligado), middleware de sessão, guarda de `/admin/**` no servidor, convite de barbeiros pelo servidor. Recuperação de senha: redefinição pelo proprietário com troca forçada + quebra-vidro do proprietário; redefinição por e-mail se o proprietário configurar SMTP (sem custo obrigatório). Nenhuma dependência de SMS.
5. Telas: Equipe (com foto no Storage), Serviços, Configurações.
6. Catálogo público (view/RPC) alimentando a home no lugar dos estados vazios.

Aceite: equipe só entra com perfil; barbeiro não acessa telas do proprietário (testado no banco e na rota); anônimo lê apenas o catálogo público; fotos sobem com restrição de tipo/tamanho.
Testes: SQL de RLS por papel; domínio; fluxo de login em staging.

## Fase 02 — Motor de disponibilidade e agenda administrativa ⬜

Tarefas: `working_hours`, `schedule_blocks`, `appointments` + exclusion constraint; `available_slots()`; RPCs de criar/editar/cancelar administrativos; agenda diária e semanal por barbeiro e geral; bloqueios, folgas, férias.
Aceite: nenhum caminho (API, RPC, SQL) cria sobreposição; disponibilidade considera expediente, duração, bloqueios, intervalos e reservas ativas; cálculo correto no fuso do negócio, inclusive perto da meia-noite.
Testes: SQL de sobreposição; **teste de concorrência** (N reservas simultâneas do mesmo horário, só 1 vence); domínio dos cortes de faixa.

## Fase 03 — Experiência pública e agendamento do cliente ⬜

Tarefas: escolha de serviço → barbeiro → horário; nome/telefone como **contato não verificado**; `book_appointment`; acesso às próprias reservas por segredo de aparelho/link (hash no banco); cancelamento até 2 h antes; antiabuso sem SMS (limites no banco, teto de reservas ativas, honeypot, bloqueio de número).
Aceite: reserva confirmada na hora e idempotente; cliente nunca informa término/preço; cancelamento recusado após o prazo, com mensagem clara; saber o telefone de alguém não dá acesso à reserva dele; abuso limitado pelas travas.
Dependência: aprovação do desenho de identidade do cliente (`ARCHITECTURE.md`, seção 4.2). Nenhum serviço externo ou custo por mensagem.

## Fase 04 — Atendimentos, clientes e histórico ⬜

Tarefas: registrar concluído/falta, cadastro e histórico de clientes, busca, trilha de eventos.
Aceite: transição de status válida e auditada; concluir duas vezes não duplica nada.

## Fase 05 — Financeiro, caixa, despesas, pagamentos e comissões ⬜

Tarefas: `charges`/`payments` como razão com estorno; despesas; caixa; regras e lançamentos de comissão; visão do barbeiro limitada aos próprios ganhos.
Aceite: faturamento, recebido, pendente e despesas separados; editar/concluir/corrigir **não** gera receita duplicada (índices únicos + idempotência); nada é apagado; barbeiro não lê financeiro geral.
Testes: SQL de integridade e de permissão; domínio de comissão com casos de borda de arredondamento.

## Fase 06 — Indicadores e relatórios ⬜

Tarefas: resultado por período (competência × caixa), ocupação, faltas, desempenho por barbeiro, exportação.
Aceite: números reconciliam com o razão; período calculado sempre no fuso do negócio.

## Fase 07 — Segurança, testes, PWA e lançamento ⬜

Tarefas: revisão de RLS e ACLs no Supabase real, CSP, auditoria de dependências, E2E com Playwright (mobile e desktop), service worker e testes de instalação em aparelhos, CI, observabilidade, política de privacidade, backup/restauração testados, plano de rollback, deploy **com autorização**.
Aceite: checklist de lançamento assinado pelo proprietário; nenhuma credencial privilegiada no bundle; fluxo completo testado em aparelho real.
