# Guia de publicação: GitHub, Supabase e Vercel

Ordem recomendada: **GitHub → (CI fecha a Fase 00) → Supabase → Vercel.** Nada aqui é automático: cada passo é seu, com as suas contas. **Nunca cole chaves do Supabase em chats, issues ou arquivos do repositório.**

> Os nomes de menus de GitHub, Supabase e Vercel mudam com frequência. Se algum botão não estiver onde está escrito, procure pelo nome na busca da própria página e confira a documentação oficial.

## 1. GitHub

1. Crie um repositório **privado e vazio** (sem README, sem .gitignore, sem licença), por exemplo `bolonha-app`.
2. Na pasta do projeto, na sua máquina:
   ```bash
   git init -b main
   git add .
   git status                      # confira: NÃO pode aparecer .env.local nem node_modules
   git commit -m "Fase 00: fundação do Bolonha App"
   git remote add origin git@github.com:SEU_USUARIO/bolonha-app.git   # ou a URL https
   git push -u origin main
   ```
3. O push dispara `.github/workflows/ci.yml` (aba **Actions**). É a primeira vez que o projeto roda `npm install`, `lint`, `typecheck`, testes, `build` e `test:db` num ambiente com acesso ao npm. **Esse resultado é o que fecha (ou não) a Fase 00.** Se algo falhar, copie o log para cá e corrigimos antes de seguir.
4. O `package-lock.json` já foi gerado e commitado pelo próprio CI (17/10/2026); a partir daí o CI usa `npm ci` com cache.
5. Recomendado (Settings do repositório): proteger a branch `main` exigindo o CI verde em pull requests.

## 2. Supabase

> **Estado em 17/10/2026:** o projeto **Hive Barber** (ref `kvhjtauerzrppzdfxpiw`, região us-east-1) já existe e recebeu as migrações `0001_foundation` e `0002_helpers_search_path`, aplicadas por Claude com a sua autorização. Conferido no banco real: nenhuma tabela sem RLS; `anon` executa só `app_timezone`, `local_date` e `local_today`; `btree_gist` no schema `extensions`; o alerta de segurança do Supabase (search_path) foi corrigido pela `0002` e o advisor ficou limpo. **Falta, no painel:** desligar o cadastro público (passo 2 abaixo). Os passos 1, 3 e 4 abaixo servem para um projeto novo.
>
> Migrações aplicadas por Claude ficam registradas no Supabase com data/hora como versão (ex.: `20261017...`), enquanto os arquivos do repositório têm numeração `0001`, `0002`. Por isso, **não use `supabase db push` neste projeto sem antes reconciliar**: continue aplicando migrações por Claude (ou pelo SQL Editor) e mantendo o arquivo no repositório.

O banco hoje é **pequeno de propósito**: a migração `0001` só traz funções de data, a extensão da agenda e os privilégios seguros por padrão. As tabelas de negócio chegam na Fase 01. Criar o projeto agora serve para validar a migração e as ACLs no Supabase real.

1. (Projeto novo) Em supabase.com, crie um projeto, região **South America (São Paulo)** (o atual está em us-east-1: funciona, só tem um pouco mais de latência; a região não pode ser trocada depois). Guarde a **senha do banco** num gerenciador de senhas.
2. **Authentication → sign-in/providers (ou Settings)**: desligue **"Allow new users to sign up"** (cadastro público). A equipe será criada pelo servidor na Fase 01. Mantenha o provedor **Email** ligado; não ative Phone/SMS.
3. Aplicar a migração (escolha uma):
   - **SQL Editor:** abra `supabase/migrations/0001_foundation.sql`, cole inteiro e execute.
   - **CLI do Supabase:** `npx supabase login`, `npx supabase link --project-ref SEU_REF`, `npx supabase db push` (pede a senha do banco). Use a CLI quando houver mais de uma migração.
   Aplique sempre na ordem numérica. Migrações já aplicadas **não se editam**: correções entram como arquivo novo.
4. Verificar: cole `supabase/checks/verify_security.sql` no SQL Editor (é só leitura) e confira os resultados esperados escritos nos comentários. Isso fecha o item "ACLs no Supabase real" da Fase 00 (se o resultado divergir, me envie).
5. **Project Settings → API (ou API Keys)**: anote a **Project URL**, a chave **publishable/anon** (pública) e a chave **service_role/secret** (**privada**, ignora o RLS). Elas vão **somente** para as variáveis de ambiente da Vercel e para o seu `.env.local`.
6. Plano gratuito: projetos sem uso podem ser **pausados** pelo Supabase e o plano não é pensado para produção com dados de clientes (backups, suporte). Antes do lançamento, avalie o plano pago e o backup. Confirme os limites atuais no site do Supabase.
7. Staging e produção: o ideal é **dois projetos** (`bolonha-staging` para testes, `bolonha-prod` para o real), cada um com suas chaves. Comece só com o de staging.

## 3. Vercel

1. Em vercel.com, **Add New → Project → Import** o repositório do GitHub. Framework: **Next.js** (detectado sozinho). Root directory: a raiz. Em **Settings → General → Node.js Version**, escolha **22.x**.
2. **Environment Variables** (Settings → Environment Variables):

   | Variável | Valor | Observação |
   | --- | --- | --- |
   | `NEXT_PUBLIC_APP_URL` | URL do deploy (ex.: `https://bolonha-app.vercel.app`; depois, o domínio próprio) | pública |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL | pública |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave publishable/anon | pública (a segurança vem do RLS) |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave service_role/secret | **privada**: marque como *Sensitive*, **nunca** com prefixo `NEXT_PUBLIC_` |
   | `APP_TIMEZONE` | `America/Sao_Paulo` | |
   | `NEXT_PUBLIC_ALLOW_INDEXING` | deixe **vazio** até o lançamento | com `true`, o Google pode indexar |

   Variáveis `NEXT_PUBLIC_*` são embutidas **no build**: ao alterar uma, faça **Redeploy**. Use as chaves do projeto **staging** nos ambientes Preview/Development e as de produção só em Production.
3. **Deploy.** Na Fase 00 o site funciona mesmo sem as variáveis do Supabase (nenhuma tela as usa ainda), então dá para publicar primeiro e configurar depois.
4. Conferir o resultado: `/` carrega com a identidade visual; `/agendar` mostra o esqueleto "em construção" (o agendamento **ainda não funciona**); `/admin` responde **404** em produção (de propósito, até existir login na Fase 01).
5. **Domínio próprio:** Settings → Domains; ajuste o DNS no registrador; atualize `NEXT_PUBLIC_APP_URL` e faça Redeploy.

### Antes de divulgar o endereço

- O plano **Hobby** da Vercel é, pelos termos que conheço, para uso **não comercial**; uma barbearia é negócio. Confirme nos termos atuais e use o plano pago quando for ao ar de verdade.
- Endereço, telefone e horários na home vieram de capturas do Instagram e **não foram confirmados**; a logo é provisória. Peça a confirmação do proprietário antes de divulgar.
- Ative **Deployment Protection** (proteção de previews) em Settings → Deployment Protection, para que só você veja versões de teste.

## 4. Lista de segurança (conferir antes de cada publicação)

- [ ] Repositório **privado**; `git status` sem `.env*` (exceto `.env.example`).
- [ ] Nenhuma chave real em código, commits, issues ou prints.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` só na Vercel (servidor) e marcada como sensível.
- [ ] Cadastro público de usuários **desligado** no Supabase.
- [ ] `verify_security.sql` rodado: sem tabelas sem RLS; `anon` só com as 3 funções esperadas.
- [ ] CI verde (lint, tipos, testes, build, `test:db`).
- [ ] `/admin` retorna 404 em produção; indexação desligada.
- [ ] Migrações aplicadas **só** com sua autorização e primeiro em staging.

## 5. Fluxo do dia a dia

Branch → pull request → CI verde → merge em `main` → a Vercel publica sozinha (Production). Cada PR ganha um *Preview*. Migrações novas: aplicar em staging, testar, depois em produção, **manualmente**.
