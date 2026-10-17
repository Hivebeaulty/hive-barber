// Cliente para Server Components / Server Actions / Route Handlers.
// Usa a chave pública + a sessão do usuário (cookies) => respeita o RLS.
import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "../env.ts";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseKey } = getPublicEnv();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component (cookies somente leitura). É seguro
          // ignorar SE o middleware renova a sessão (Fase 01 adiciona o middleware).
        }
      },
    },
  });
}
