-- 0002 — Fixa o search_path dos helpers de data.
-- Motivo: o advisor de segurança do Supabase (function_search_path_mutable) alertou
-- as três funções criadas na 0001. Elas são puras (não leem tabelas), então o risco
-- era baixo, mas o alerta some e o padrão fica correto para as próximas funções.
-- Migração nova em vez de editar a 0001, que já foi aplicada no Supabase.
alter function public.app_timezone() set search_path = '';
alter function public.local_date(timestamptz) set search_path = '';
alter function public.local_today() set search_path = '';
