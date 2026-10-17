-- Verificação SOMENTE LEITURA para colar no SQL Editor do Supabase (projeto real).
-- Não altera nada. Complementa (não substitui) supabase/tests/*.test.sql, que usam
-- comandos do psql e só rodam em banco descartável.

-- 1) Tabelas do schema public SEM RLS. Esperado: nenhuma linha.
select c.relname as tabela_sem_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;

-- 2) Funções do schema public executáveis por anon (fora de extensões).
--    Esperado na Fase 00: exatamente app_timezone, local_date, local_today.
select p.proname as funcao_executavel_por_anon
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  and has_function_privilege('anon', p.oid, 'execute')
order by 1;

-- 3) btree_gist deve estar no schema "extensions". Esperado: extensions.
select n.nspname as schema_da_btree_gist
from pg_extension e join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'btree_gist';

-- 4) Fuso do negócio. Esperado: America/Sao_Paulo e o dia local de 23h30 em Brasília (10/03).
select public.app_timezone() as fuso,
       public.local_date('2030-03-11 02:30:00+00') as dia_local_esperado_2030_03_10;
