-- Testes da migração 0001 (Postgres puro + stub). Cada verificação lança exceção
-- se falhar; o runner (scripts/db-test.sh) aborta no primeiro erro.
\set ON_ERROR_STOP 1
\pset tuples_only on

do $$
declare
  v text;
begin
  -- fuso do negócio
  assert public.app_timezone() = 'America/Sao_Paulo', 'app_timezone';

  -- 23:30 em Brasília (UTC-3) de 10/03 já é 02:30 UTC de 11/03: o dia LOCAL é 10.
  assert public.local_date('2030-03-11 02:30:00+00') = date '2030-03-10', 'local_date depois das 21h (o bug do Áurea)';
  -- 00:30 em Brasília de 11/03 é 03:30 UTC de 11/03: dia local 11.
  assert public.local_date('2030-03-11 03:30:00+00') = date '2030-03-11', 'local_date logo após a meia-noite';
  -- a conversão independe do fuso da sessão
  set local timezone = 'Asia/Tokyo';
  assert public.local_date('2030-03-11 02:30:00+00') = date '2030-03-10', 'local_date ignora o fuso da sessão';
  reset timezone;

  -- extensão da agenda
  assert exists (select 1 from pg_extension where extname = 'btree_gist'), 'btree_gist instalada';
  assert (select n.nspname from pg_extension e join pg_namespace n on n.oid = e.extnamespace
          where e.extname = 'btree_gist') = 'extensions', 'btree_gist fora do schema public (API exposta)';
end $$;

-- trigger genérico de updated_at
create temp table t_upd (id int primary key, updated_at timestamptz not null default '2000-01-01');
create trigger t_upd_set before update on t_upd for each row execute function public.set_updated_at();
insert into t_upd (id) values (1);
update t_upd set id = 1 where id = 1;
do $$ begin
  assert (select updated_at from t_upd where id = 1) > now() - interval '1 minute', 'set_updated_at atualiza a coluna';
end $$;

-- privilégios seguros por padrão: função NOVA não é executável por anon/public
create function public.zz_probe_default_privileges() returns int language sql as $$ select 1 $$;
do $$
begin
  assert not has_function_privilege('anon', 'public.zz_probe_default_privileges()', 'execute'),
    'função nova NÃO deve ser executável por anon';
  assert not has_function_privilege('authenticated', 'public.zz_probe_default_privileges()', 'execute'),
    'função nova NÃO deve ser executável por authenticated sem GRANT explícito';
  -- helpers concedidos explicitamente
  assert has_function_privilege('anon', 'public.local_date(timestamptz)', 'execute'), 'helper concedido';
end $$;
drop function public.zz_probe_default_privileges();

\echo OK 0001_foundation
