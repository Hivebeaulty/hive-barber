# Roadmap

Produto: plataforma de gestão para barbearias com estratégia **white-label**. A **Barbearia Bolonha é o piloto real**: valida o produto, expõe problemas e define o padrão que será replicado. Modelo de implantação e decisões: `WHITE_LABEL.md`. Direção visual: `VISUAL_AUDIT.md`.

Regras:
- **Não avançar de fase sem validar a atual.** Cada fase termina com: tarefas concluídas, critérios de aceite verificados, testes escritos *e executados*, documentação atualizada e relatório com pendências.
- Uma tela ilustrativa ou um deploy publicado **não** conclui uma fase.
- Nada é declarado verificado sem evidência (log de CI, consulta ao banco, captura de tela de navegador real).

Legenda: ✅ concluída e validada · 🟡 parcial ou em andamento · ⛔ bloqueada por dependência externa · ⬜ não iniciada.

> **Numeração.** Esta é a numeração vigente (17/10/2026). Os relatórios antigos (`PHASE_00_REPORT.md`) e os comentários das migrações `0001` e `0002` (já aplicadas, imutáveis) usam a numeração anterior: antiga 01→02, 02→03, 03→04, 04→05, 05→06, 06→07, 07→08. A Fase 01 e a Fase 09 são novas.

## Quadro de status (17/10/2026)

| Fase | Nome | Status | Observação |
| --- | --- | --- | --- |
| 00 | Fundação técnica e arquitetura | 🟡 | Técnica validada no CI; faltam itens de confirmação (ver abaixo) |
| 01 | Direção de produto, design e preparação white-label | 🟡 | Planejamento feito (este documento); execução não iniciada |
| 02 | Acesso e configuração da barbearia | ⬜ | Depende da 01 (tokens e camada de configuração) |
| 03 | Motor de agendamento | ⬜ | Depende da decisão de fuso (D2) e da 02 |
| 04 | Experiência pública e gestão da agenda | ⬜ | Depende da 03 e da aprovação visual |
| 05 | Clientes e atendimentos | ⬜ | |
| 06 | Financeiro e comissões | ⬜ | |
| 07 | Indicadores e gestão | ⬜ | |
| 08 | Segurança, experiência e lançamento do piloto | ⬜ | |
| 09 | Validação comercial e replicação white-label | ⬜ | Só após o piloto |

Bloqueios externos hoje: **logo original em alta resolução**, **moodboard e fotos reais**, **confirmação dos dados da barbearia** (endereço, telefone, horários) e **aprovação da direção visual**. Nenhum bloqueia a parte técnica da Fase 01, mas os três primeiros bloqueiam o *fechamento visual*.

## Fase 00 — Fundação técnica e arquitetura 🟡

**Confirmado (evidência):**
- CI do GitHub verde: `npm ci`/install, lint, typecheck com tipos reais, 15 testes de domínio, build de produção, testes SQL em Postgres 16 descartável (execução `39063670678`).
- Deploy na Vercel concluído; home, `/agendar` e `manifest` respondendo (leitura de texto das páginas, 17/10).
- Supabase (projeto Hive Barber): migrações `0001` e `0002` aplicadas; nenhuma tabela; advisor de segurança sem alertas; `anon` executa só as 3 funções de data (consulta ao banco real, 17/10).
- `package-lock.json` versionado; versões resolvidas registradas em `PHASE_00_REPORT.md`.

**Pendente:**
- Inspeção visual em navegador real (390 e 1280 px) com fonte e ícones definitivos: **não realizada** (as imagens de `docs/assets/` vêm de um harness com Inter e glifos substitutos).
- `/admin` com 404 em produção: confirmado só de forma indireta (mesmo erro de uma rota inexistente).
- Variáveis de ambiente e proteção de deploy na Vercel, e cadastro público desligado no Supabase: **não verificáveis** com as conexões atuais.
- Logo provisória; dados do negócio não confirmados; moodboard não localizado.
- Aprendizados a corrigir antes de crescer: `APP_TIMEZONE` está documentada mas **não é lida por nada** (o fuso real está fixo no SQL); `brand.ts` ainda diz "cópias independentes do repositório" (decisão superada pelo white-label).

**Aceite para fechar:** evidência visual real aprovada (Fase 01), itens de confirmação conferidos ou registrados como não verificáveis, e as duas incoerências acima corrigidas.

## Fase 01 — Direção de produto, design e preparação white-label 🟡

Aproveita o que existe; **não recomeça o projeto**. Duas etapas, com um portão de aprovação no meio.

**Etapa A — Evidência e direção (sem implementar telas novas)**
1. Pipeline de evidência visual no CI: Playwright (Chromium e WebKit) tira capturas de `/`, `/agendar` e `/admin` (build local) em 390×844 e 1280×800 e publica numa branch de evidências, que a equipe consegue abrir. Não substitui aparelho real; substitui "ninguém viu".
2. Coletar insumos: moodboard e referências do proprietário, fotos reais (fachada, salão, barbeiros), logo em alta resolução, dados confirmados.
3. Dois *spikes* visuais curtos da home (Direção A "Ripado" e Direção B "Comanda", ver `VISUAL_AUDIT.md`) em dispositivos reais.
4. **Portão:** o proprietário escolhe a direção. Sem aprovação, a Etapa B não começa.

**Etapa B — Preparação white-label e implementação do sistema visual aprovado**
1. Tokens **semânticos** (`superficie`, `texto`, `acao`, `textura`…) no lugar dos nomes presos à paleta (`carvao`, `azul`…); promover os hex soltos (3 arquivos) a tokens.
2. Camada de identidade e configuração: um único acesso `getShop()` com valores padrão neutros; remover o acoplamento a `brand.ts`/`business.ts` e ao nome "Bolonha" em `metadata`, `manifest` e painel.
3. Decisões D1 a D8 de `WHITE_LABEL.md` aprovadas e registradas; **fuso por implantação** (migração nova) e **versionamento de migrações compatível com a CLI do Supabase**.
4. Dados da Bolonha como *seed* (dados, não código); pacote neutro "Sua Barbearia" como padrão do produto.
5. Home, `/agendar` (esqueleto) e casca do painel refeitos na direção aprovada, com estados vazios desenhados.
6. Validação: CI verde + capturas reais aprovadas + checagem automática de contraste de qualquer paleta de barbearia (AA).

**Aceite:** direção aprovada por escrito; nenhum nome, endereço, cor ou texto da Bolonha em componentes (só em *seed* e ativos); trocar a identidade padrão por outra não exige editar componentes (demonstrado com uma segunda identidade de teste, fictícia e rotulada); capturas de navegador real anexadas ao relatório; D1 a D8 decididas.

## Fase 02 — Acesso e configuração da barbearia ⬜

Autenticação da equipe (e-mail e senha, cadastro público desligado, recuperação por e-mail ou redefinição pelo proprietário), papéis `owner` e `barber`, perfis, `business_settings` (dados da barbearia, **identidade visual editável**, fuso, política de cancelamento), logo e fotos no Storage, profissionais, serviços, associação profissional × serviço, guarda de `/admin/**`, catálogo público (view/RPC) alimentando a home.
Aceite: equipe só entra com perfil; barbeiro não acessa telas do proprietário (testado no banco e na rota); anônimo lê só o catálogo público; upload com restrição de tipo e tamanho; identidade trocada pelo painel reflete no site sem deploy de código.
Testes: SQL de RLS por papel; domínio; login em staging.

## Fase 03 — Motor de agendamento ⬜

`working_hours`, `schedule_blocks`, `appointments` com *exclusion constraint*; `available_slots()`; duração e preço vindos do cadastro; validação de expediente e disponibilidade do profissional; RPCs transacionais; fuso por implantação.
Aceite: nenhum caminho (API, RPC, SQL) cria sobreposição, inclusive sob concorrência; cálculo correto perto da meia-noite no fuso da barbearia.
Testes: SQL de sobreposição; **teste de concorrência versionado** (N reservas simultâneas, só 1 vence); domínio das faixas.

## Fase 04 — Experiência pública e gestão da agenda ⬜

Fluxo completo do cliente (serviço → profissional → horário → contato → confirmação), identidade do cliente **sem SMS** (segredo por aparelho/link, antiabuso no banco), cancelamento até o prazo; agenda administrativa (dia e semana, por profissional e geral), bloqueios, folgas, encaixes. Cria a tabela mínima de `customers` necessária à reserva.
Aceite: reserva confirmada na hora e idempotente; cliente nunca informa término ou preço; cancelamento recusado após o prazo com mensagem clara; saber um telefone não dá acesso à reserva; fluxo aprovado em aparelhos reais.

## Fase 05 — Clientes e atendimentos ⬜

Cadastro e histórico de clientes, busca, registro de atendimento concluído e falta, estados operacionais e trilha de eventos.
Aceite: transição de status válida e auditada; concluir duas vezes não duplica nada.

## Fase 06 — Financeiro e comissões ⬜

`charges`/`payments` como razão com estorno; formas de pagamento; despesas; regras e lançamentos de comissão; fluxo de caixa; fechamento; histórico de ajustes; visão do barbeiro limitada aos próprios ganhos.
Aceite: faturamento, recebido, pendente e despesas separados; corrigir não duplica receita; nada é apagado; barbeiro não lê o financeiro geral.
Testes: SQL de integridade e permissão; domínio de comissão com arredondamento.

## Fase 07 — Indicadores e gestão ⬜

Resultado por período (competência × caixa), ocupação, faltas, desempenho por profissional, exportação.
Aceite: números reconciliam com o razão; períodos calculados no fuso da barbearia.

## Fase 08 — Segurança, experiência e lançamento do piloto ⬜

Revisão de RLS e ACLs no Supabase real, CSP, auditoria de dependências, E2E (Playwright) em mobile e desktop, PWA com service worker, validação em aparelhos reais, backup e restauração testados, política de privacidade (LGPD), plano de rollback, plano pago adequado ao uso comercial, treinamento e operação da Bolonha, deploy **com autorização**.
Aceite: checklist de lançamento assinado pelo proprietário; nenhuma credencial privilegiada no bundle; fluxo completo testado em aparelho real; a Bolonha opera sem apoio técnico por um período combinado.

## Fase 09 — Validação comercial e replicação white-label ⬜

Depois do piloto: implantar uma **segunda barbearia** seguindo o roteiro documentado (`WHITE_LABEL.md`, seção 6), medir tempo e custo, corrigir o roteiro, decidir o que automatizar (criação de projetos, migração em lote, *seed*) e **reavaliar multiempresa** com dados reais (critérios na seção 5 de `WHITE_LABEL.md`).
Aceite: segunda implantação concluída por pessoa que não escreveu o código, só com o roteiro, sem editar componentes; custo e tempo registrados.

## Ajustes de ordem em relação à proposta e justificativas

1. **Cliente mínimo entra na Fase 04**, não na 05: a reserva precisa de `customers`; a 05 só amplia (histórico, busca).
2. **Fuso por implantação antes da Fase 03**: o motor de agenda depende do fuso; corrigir depois seria migração sobre tabelas com dados.
3. **Etapa A da Fase 01 antes de qualquer tela nova**, com portão de aprovação: evita refazer telas da Fase 02 em diante.
4. **Identidade editável na Fase 02** (não na 01): precisa de autenticação, Storage e `business_settings`; a Fase 01 só prepara o terreno (tokens e `getShop()`).
5. **Fase 00 segue 🟡** até haver evidência visual real; o CI verde fecha a parte técnica, não a visual.
