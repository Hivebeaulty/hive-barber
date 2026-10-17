"use client";

// Cliente do navegador: chave pública + RLS. Nunca recebe a service role.
import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "../env.ts";

export function createBrowserSupabase() {
  const { supabaseUrl, supabaseKey } = getPublicEnv();
  return createBrowserClient(supabaseUrl, supabaseKey);
}
