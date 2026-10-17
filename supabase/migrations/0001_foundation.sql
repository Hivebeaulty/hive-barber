-- ============================================================================
-- 0001 — Fundação (Fase 00)
--
-- Só infraestrutura reutilizável. NENHUMA tabela de negócio nasce aqui: perfis,
-- profissionais, serviços e agenda entram nas migrações da Fase 01 em diante.
--
--   1. Extensões necessárias ao motor de agenda (exclusion constraint).
--   2. Privilégios SEGUROS POR PADRÃO para funções futuras.
--   3. Fuso do negócio como fonte única no banco.
--   4. Helpers de data no fuso do negócio.
--   5. Trigger genérico de updated_at.
--   6. Concessões explícitas das funções inofensivas.
--
-- Decisão derivada da auditoria do Áurea (docs/REFERENCE_AUDIT.md): lá, funções
-- novas herdavam EXECUTE para "anon" e cada migração precisava lembrar de
-- revogar. Aqui a regra se inverte: nada é executável por anon/public a menos
-- que a migração conceda explicitamente.
-- ============================================================================

-- 1. Extensões ----------------------------------------------------------------
-- btree_gist: permite "barber_id WITH =" junto de "tstzrange WITH &&" na
-- exclusion constraint que impede reservas sobrepostas (Fase 02).
-- Instalada no schema "extensions" (padrão do Supabase) para que as funções da
-- extensão NÃO apareçam na API exposta (schema public). Migrações que criarem a
-- constraint precisam do schema "extensions" no search_path (o Supabase já o inclui).
create extension if not exists btree_gist with schema extensions;

-- 2. Privilégios seguros por padrão -----------------------------------------------
-- DEVE vir ANTES de qualquer função: só vale para funções criadas depois (o teste
-- supabase/tests/0002_security_guards.test.sql pegou uma função que ficou exposta a
-- "anon" justamente por estar acima deste ponto).
-- Vale para funções criadas PELO ROLE que roda as migrações (no Supabase, "postgres").
-- Cada função que precisar ser chamada pelo app deve conceder EXECUTE explicitamente:
--   grant execute on function public.minha_rpc(...) to authenticated;
--
-- São DOIS comandos de propósito (descoberto ao testar esta migração):
--   a) o EXECUTE para PUBLIC é o padrão embutido do Postgres e só pode ser
--      removido por ALTER DEFAULT PRIVILEGES *sem* "in schema";
--   b) os GRANTs padrão que o Supabase dá a anon/authenticated/service_role no
--      schema public são removidos por um comando *com* "in schema public".
-- A extensão da seção 1 já foi criada acima, portanto não é afetada.
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- 3. Fuso do negócio ------------------------------------------------------------
create or replace function public.app_timezone()
returns text
language sql
immutable
parallel safe
as $$ select 'America/Sao_Paulo'::text $$;

-- 4. Helpers de data no fuso do negócio ---------------------------------------
-- Auditoria do Áurea: cálculos com ::date usavam o fuso da sessão (UTC) e depois
-- das ~21h de Brasília o "dia" já era o seguinte (corrigido só na 0006 de lá).
-- Estes helpers existem para que NENHUMA consulta de dia/semana/mês converta
-- timestamptz para date sem passar pelo fuso do negócio.
create or replace function public.local_date(ts timestamptz)
returns date
language sql
immutable
parallel safe
as $$ select (ts at time zone 'America/Sao_Paulo')::date $$;

create or replace function public.local_today()
returns date
language sql
stable
parallel safe
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

-- 5. updated_at ------------------------------------------------------------------
-- Função de trigger: não precisa (nem deve ter) EXECUTE para anon/authenticated.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 6. Concessões explícitas -------------------------------------------------------
-- Os helpers de data são puros (sem acesso a tabelas) e o app os usa em consultas.
grant execute on function public.app_timezone() to anon, authenticated, service_role;
grant execute on function public.local_date(timestamptz) to anon, authenticated, service_role;
grant execute on function public.local_today() to anon, authenticated, service_role;
