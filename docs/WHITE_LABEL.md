# Estratégia white-label

Estado: **proposta para aprovação** (17/10/2026). Nada aqui foi implementado ainda; as ações estão no roadmap (Fase 01 em diante). Onde o texto diz "hoje", é o que foi verificado no repositório e no Supabase em 17/10/2026.

## 1. Posição

O produto é uma plataforma de gestão para barbearias, vendida a várias barbearias, cada uma com sua identidade. A Barbearia Bolonha é o **piloto**: valida o produto e define o padrão. A Bolonha não é a identidade do software.

**Recomendação central: uma implantação por barbearia, sobre a mesma base de código e as mesmas migrações. Não construir multiempresa agora.**

Uma implantação = um projeto Supabase + um projeto Vercel + um domínio, com variáveis próprias. Não há *fork* por cliente: a diferença entre barbearias está em **dados** (banco e Storage) e **variáveis de ambiente**, nunca em código.

## 2. Por que instância por barbearia (e não multiempresa) agora

| | Instância por barbearia (recomendada) | Multiempresa (um banco para todas) |
| --- | --- | --- |
| Isolamento de dados | Total, pela própria infraestrutura | Depende de RLS correto em toda tabela, para sempre |
| Risco de vazamento entre clientes | Praticamente nulo | Um erro de política expõe todas as barbearias |
| Complexidade do código | A atual | `shop_id` em toda tabela, política, índice, restrição e teste |
| Domínio e marca por cliente | Natural (cada Vercel tem o seu) | Exige resolução por host, certificados e cache por cliente |
| Backup, exportação, exclusão (LGPD) | Por projeto, simples | Por filtro, com risco de erro |
| Custo operacional | Cresce linearmente (um Supabase e um Vercel por barbearia) | Menor por cliente |
| Atualizar todas | Aplicar a migração em N projetos (precisa de roteiro/script) | Uma vez |
| Piloto | Já é assim | Reescreve o que existe |

Escolhemos a esquerda porque o piloto é uma barbearia, o risco de vazamento é o pior defeito possível e o custo de operar poucas instâncias é baixo. **Quando reavaliar** (critérios na seção 5): quando o custo e o tempo de operar N instâncias passarem a pesar mais que o risco e o esforço de uma migração para multiempresa, ou se surgir demanda real de um proprietário com várias unidades.

## 3. Camadas: produto, identidade, dados e configuração

| Camada | O que é | Onde mora | Quem altera |
| --- | --- | --- | --- |
| **Núcleo do produto** | Regras, telas, componentes, migrações, testes | Repositório | Equipe do produto |
| **Identidade** | Nome, logo, paleta, par tipográfico, textura, raio, imagens de capa, textos de marca | `business_settings` (banco) + Storage; valores padrão neutros no código | Proprietário da barbearia (painel) |
| **Dados operacionais** | Profissionais, serviços, preços, horários, clientes, agenda, financeiro | Banco | Barbearia, no uso diário |
| **Configuração da implantação** | Chaves do Supabase, URL pública, domínio, ambiente | Variáveis de ambiente | Quem implanta |
| **Permissões e usuários** | `owner`, `barber`, convites | `staff_profiles` + Supabase Auth | Proprietário |

Hoje a identidade está em **arquivos de código** (`src/config/brand.ts`, `business.ts`, `globals.css`, `public/brand/`, `manifest.ts`) e a Bolonha aparece também em textos de `metadata` e do painel. A Fase 01 desfaz isso.

### 3.1 Identidade configurável: o desenho

1. **Um único ponto de leitura:** `getShop()` (servidor) devolve identidade e dados de contato, combinando `business_settings` com **padrões neutros** ("Sua Barbearia", sem endereço, sem telefone). Componentes recebem esses valores; nenhum componente importa `brand.ts`/`business.ts` diretamente.
2. **Tokens em três níveis:** *primitivos* (a paleta da barbearia) → *semânticos* (`superficie`, `superficie-alta`, `linha`, `texto`, `texto-suave`, `acao`, `acao-texto`, `textura`, `sucesso`, `alerta`, `erro`) → *componentes*. Os componentes usam **só** os semânticos. Hoje as classes usam nomes presos à paleta (`carvao`, `azul`, `madeira`): migrar agora custa pouco e depois custaria um refator em todas as telas.
3. **Pontos de personalização limitados e curados** (o núcleo visual não é aberto a tudo):
   - paleta: 6 cores nomeadas, validadas automaticamente (contraste AA; paleta que reprova não é aceita);
   - **par tipográfico a escolher de uma lista curada** (as fontes entram no *build* por `next/font`; fonte arbitrária fica fora);
   - textura de fundo: ripado, liso ou nenhuma;
   - escala de raio: reta ou suave;
   - logo (e variante para fundo claro, se houver), imagem de capa e fotos;
   - textos de marca (nome, frase de apoio).
   Layout, animações e comportamento dos componentes são do núcleo e iguais para todas.
4. **Aplicação em tempo de requisição:** o layout injeta as variáveis CSS a partir de `getShop()`; mudar a identidade no painel vale sem novo deploy. A leitura é cacheada por implantação e invalidada quando o proprietário salva, para não custar desempenho.
5. **PWA e metadados** (`manifest`, ícones, `theme-color`, título, descrição) derivam de `getShop()`; os ícones são gerados a partir do logo enviado (Fase 02).
6. **Domínio:** cada implantação tem o seu na Vercel. O código só usa `NEXT_PUBLIC_APP_URL`, nunca um domínio fixo. Resolução por host dentro de uma mesma instância **não** é construída (e nada a impede no futuro).

### 3.2 O que fica fora (de propósito)

Idiomas além do português do Brasil, outras moedas (valores em **centavos inteiros em BRL**), telefones fora do Brasil, temas arbitrários, editor visual de layout, domínio por host em uma só instância, painel de operador da plataforma. O produto declara **escopo Brasil**; internacionalizar é uma decisão futura, não uma sobra.

## 4. Banco de dados: o que decidir agora e o que esperar

### 4.1 O que já existe e o que precisa mudar

- Existem só funções de data e privilégios seguros (`0001`, `0002`), aplicadas no Supabase. **Nenhuma tabela de negócio**: ainda dá para decidir sem migração destrutiva.
- **Fuso hoje fixo no SQL** (`app_timezone()`, `local_date()`, `local_today()` com `America/Sao_Paulo` escrito dentro). A variável `APP_TIMEZONE` está documentada, mas **nenhum código a lê**: duas fontes da verdade, só uma real. O Brasil tem mais de um fuso; uma barbearia em Manaus quebraria o motor de agenda.
  **Decisão D2:** o fuso passa a ser dado da implantação (`business_settings.timezone`); as funções passam a lê-lo (`stable`, não `immutable`) ou a receber o fuso como parâmetro; `APP_TIMEZONE` vira apenas o valor inicial do *seed* ou sai. Migração nova **antes** de qualquer tabela que dependa de data local.

### 4.2 Entidades e referência ao estabelecimento

Em instância por barbearia **nenhuma coluna `shop_id` é necessária**. A tabela abaixo mostra o que mudaria se um dia houver multiempresa, para provar que a decisão de **não** adicionar agora não gera migração destrutiva.

| Entidade | Mudaria numa futura multiempresa? | Observação |
| --- | --- | --- |
| `business_settings` | Sim: de linha única para uma linha por barbearia | Hoje com restrição de linha única; PK muda sem perda de dados |
| `staff_profiles` | Sim: vínculo com a barbearia | Papéis `owner`/`barber` valem por barbearia |
| `barbers`, `services`, `service_categories` | Sim: referência direta | Nomes únicos passam a ser únicos por barbearia |
| `barber_services`, `working_hours`, `schedule_blocks`, `appointments`, `appointment_events` | **Não diretamente**: herdam pelo profissional ou serviço | A *exclusion constraint* é por `barber_id` (UUID): já é segura entre barbearias |
| `customers` | Sim; telefone único passa a ser por barbearia | O mais sensível: cliente de uma barbearia não pode aparecer na outra |
| `charges`, `payments`, `expenses`, `commission_*` | Sim, direto ou por herança | Financeiro é onde um erro custa mais |
| `audit_log` | Sim | |

**Custo do retrofit (estimado, não medido):** adicionar a coluna com valor padrão constante (metadados, sem reescrever a tabela nas versões atuais do Postgres), preencher com um único valor, criar a chave estrangeira, refazer índices e restrições únicas para incluir a coluna e reescrever as políticas. É trabalho real, mas **não destrutivo** e pequeno se as regras abaixo forem seguidas desde já.

### 4.3 Regras de modelagem que deixam a porta aberta (valem desde a Fase 02)

1. Toda tabela de negócio: `id uuid`, `created_at`, `updated_at`; chaves por UUID, nunca por nome ou número da Bolonha.
2. Restrições e índices **nomeados** (facilita refazer com mais uma coluna).
3. **Políticas RLS só chamam funções auxiliares** (`is_owner()`, `is_staff()`, `current_barber_id()`), nunca subconsultas de papel soltas. Se houver multiempresa, troca-se o corpo das funções, não cada política.
4. Nenhum código assume "existe só uma barbearia" fora de `getShop()` e do acesso a `business_settings`.
5. Dinheiro em centavos; preço e duração copiados para o agendamento.
6. Nada de IDs, nomes, endereços ou cores da Bolonha em migrações. Dados dela entram por *seed* (seção 6).
7. Segurança continua obrigatória: negar por padrão, RLS em tudo, guardas de segurança nos testes (`0002_security_guards`), repetidas no Supabase real.

### 4.4 Migrações em várias instâncias (decisão D3)

Hoje os arquivos são `0001_…` e `0002_…`, mas o Supabase registrou as versões como `20261017192708` e `20261017192731` (aplicadas por ferramenta). Com uma segunda instância essa divergência vira confusão. **Recomendação:** adotar o padrão da CLI do Supabase (`AAAAMMDDHHMMSS_nome.sql`) e renomear os dois arquivos existentes para as versões já registradas, de modo que repositório e banco coincidam; a partir daí `supabase db push` funciona e um *script* aplica as migrações a uma lista de projetos. Não executado nesta etapa.

## 5. Quando considerar multiempresa

Reavaliar na Fase 09, com dados, se **qualquer** destes ocorrer:
- o custo ou o tempo de operar as instâncias (criação, atualização, suporte) passar de um limite acordado por barbearia;
- houver demanda recorrente de um proprietário com **várias unidades** (isso é outro recurso, *multiunidade*, que não exige multiempresa);
- o preço do produto não sustentar um Supabase e um Vercel por cliente.

Até lá, qualquer pedido de multiempresa precisa de justificativa por escrito. Multiempresa só entra com: coluna de referência, políticas reescritas, testes de isolamento entre barbearias, e revisão de segurança.

## 6. Roteiro de implantação replicável *(plano; ainda não validado em uma segunda barbearia)*

| # | Passo | Automatizável depois? |
| --- | --- | --- |
| 1 | Reunir insumos: nome, logo em alta resolução, paleta (ou escolher uma pré-definida), fotos, endereço, telefone, horários, profissionais, serviços e preços | Não (depende do cliente) |
| 2 | Criar o projeto Supabase (região adequada), desligar cadastro público, guardar chaves em local seguro | Parcial (CLI/MCP) |
| 3 | Aplicar **todas** as migrações na ordem; rodar a verificação de segurança somente leitura (`supabase/checks/verify_security.sql`) | Sim |
| 4 | Criar o projeto Vercel ligado ao **mesmo** repositório; preencher as variáveis de ambiente | Parcial |
| 5 | Criar o usuário administrador (proprietário) por rotina de servidor; primeiro acesso e troca de senha | Sim |
| 6 | Aplicar o *seed* da barbearia (dados e identidade), conferir com o cliente | Sim |
| 7 | Cadastrar profissionais e serviços (pelo painel) | Não |
| 8 | Domínio próprio; `NEXT_PUBLIC_APP_URL`; indexação ligada só no lançamento | Parcial |
| 9 | Validação: CI verde, capturas em aparelho real, reserva de teste ponta a ponta, conferência de permissões | Parcial |
| 10 | Plano pago adequado a uso comercial (Vercel e Supabase) e backup conferido | Não |

O **seed** é um arquivo de dados (JSON/SQL) por barbearia, fora do núcleo do produto. O da Bolonha só inclui dados **confirmados**; o que não foi confirmado fica marcado e fora.

## 7. Decisões a tomar (com recomendação)

| # | Decisão | Recomendação | Quando |
| --- | --- | --- | --- |
| D1 | Modelo: instância por barbearia, sem multiempresa | Aprovar a seção 2 | Já |
| D2 | Fuso por implantação (migração nova) | Aprovar seção 4.1 | Antes da Fase 03 (ideal: Fase 01) |
| D3 | Padrão de versionamento de migrações (CLI do Supabase) | Aprovar seção 4.4 | Fase 01 |
| D4 | Identidade no banco/Storage, padrões neutros no código | Aprovar seção 3.1 | Fase 01 |
| D5 | Papéis por implantação; sem superadministrador dentro do app | Aprovar | Fase 02 |
| D6 | Escopo Brasil (pt-BR, BRL em centavos, telefone brasileiro) | Declarar | Fase 01 |
| D7 | **Nome do produto**: "Bolonha App" é o nome do piloto; o produto precisa de nome neutro (o repositório e os projetos já usam "Hive Barber"). Confirmar nome, `package.json`, textos e pacote padrão "Sua Barbearia" | Escolher o nome do produto | Fase 01 |
| D8 | Multiunidade (várias unidades de um mesmo dono) é requisito? | Perguntar ao proprietário; padrão: não | Fase 01 |
| D9 | LGPD: cada barbearia é a controladora dos dados dos seus clientes; o operador do produto precisa de termos e de um tratamento de operador | Revisão jurídica antes do lançamento | Fase 08 |
| D10 | Modelo de custo por implantação (Vercel e Supabase pagos) | Definir preço e plano | Antes da Fase 09 |

## 8. O que muda no código agora, no mínimo

Nada nesta etapa além de documentação e da renumeração de fases em comentários e rótulos. As mudanças estruturais estão na Fase 01, Etapa B (tokens semânticos, `getShop()`, *seed*, fuso, migrações).
