import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // Solo logueamos advertencia interna en servidor, nunca exponemos la llave en errores de UI.
  console.error('[Supabase Admin] Configuración incompleta. Faltan variables de entorno.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Habilita escrituras administrativas en producción de Vercel.
 * En preview/desarrollo siguen bloqueadas salvo que ADMIN_WRITES_ENABLED=true.
 */
export function assertAdminWritesEnabled() {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const explicitlyEnabled = process.env.ADMIN_WRITES_ENABLED === 'true';

  if (!isProduction && !explicitlyEnabled) {
    throw new Error('Las escrituras administrativas todavía no están habilitadas en este entorno');
  }
}
