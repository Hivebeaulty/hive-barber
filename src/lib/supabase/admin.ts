// Cliente com SERVICE ROLE: ignora o RLS. Só no servidor, só para operações que
// realmente precisam (ex.: convidar barbeiros, tarefas de manutenção).
// O pacote "server-only" faz o build FALHAR se algum Client Component importar
// este arquivo, o que impede a chave de chegar ao navegador.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceRoleKey } from "../env.ts";

export function createServiceRoleSupabase() {
  const { supabaseUrl } = getPublicEnv();
  return createClient(supabaseUrl, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
