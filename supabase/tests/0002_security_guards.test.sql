-- Testes-guarda de segurança. Valem para TODAS as migrações futuras: se uma fase
-- criar tabela sem RLS ou função exposta a anon sem decisão explícita, este teste
-- falha. (Hoje, na Fase 00, não há tabelas de negócio: os guardas ficam vigilantes
-- e o auto-teste abaixo prova que eles de fato detectam a violação.)
\set ON_ERROR_STOP 1
\pset tuples_only on

-- Guarda 1: toda tabela do schema public tem RLS ligada.
create function pg_temp.tables_without_rls() returns text[] language sql as $$
  select coalesce(array_agg(c.relname::text order by c.relname), '{}')
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
$$;

-- Guarda 2: só as funções da lista abaixo são executáveis por anon no schema public.
-- Para liberar uma função nova a anon, a migração deve ser acompanhada de uma
-- alteração DELIBERADA desta lista (revisão de segurança explícita).
create function pg_temp.anon_executable_functions() returns text[] language sql as $$
  select coalesce(array_agg(p.proname::text order by p.proname), '{}')
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
    and has_function_privilege('anon', p.oid, 'execute')
$$;

do $$
declare
  v_allowed text[] := array['app_timezone', 'local_date', 'local_today'];
begin
  assert pg_temp.tables_without_rls() = '{}', 'tabelas sem RLS: ' || pg_temp.tables_without_rls()::text;
  assert pg_temp.anon_executable_functions() = v_allowed,
    'funções executáveis por anon fora da lista: ' || pg_temp.anon_executable_functions()::text;
end $$;

-- Auto-teste dos guardas: uma tabela sem RLS e uma função exposta DEVEM ser detectadas.
create table public.zz_guard_probe (id int);
create function public.zz_guard_probe_fn() returns int language sql as $$ select 1 $$;
grant execute on function public.zz_guard_probe_fn() to anon;
do $$
begin
  assert 'zz_guard_probe' = any (pg_temp.tables_without_rls()), 'guarda de RLS não detectou tabela sem RLS';
  assert 'zz_guard_probe_fn' = any (pg_temp.anon_executable_functions()), 'guarda de ACL não detectou função exposta';
end $$;
drop function public.zz_guard_probe_fn();
drop table public.zz_guard_probe;

\echo OK 0002_security_guards
