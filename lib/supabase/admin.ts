import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com service_role — bypassa RLS em operações administrativas.
 * NUNCA exponha este cliente no browser ou em componentes client.
 * Use apenas em Server Actions, Route Handlers ou scripts de manutenção.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      // Desliga o refresh automático de token — este cliente é sem estado.
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
