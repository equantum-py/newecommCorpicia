import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ADMIN_KEY;

const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceKey);

if (!isSupabaseAdminConfigured) {
  console.warn('[Supabase Admin] Configuración incompleta. El cliente admin quedará inactivo en este entorno.');
}

const unavailableSupabaseAdmin = new Proxy({} as SupabaseClient, {
  get() {
    throw new Error('Supabase Admin no está configurado en este entorno');
  },
});

export const supabaseAdmin: SupabaseClient = isSupabaseAdminConfigured
  ? createClient(supabaseUrl as string, supabaseServiceKey as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : unavailableSupabaseAdmin;

export function hasSupabaseAdminConfig() {
  return isSupabaseAdminConfigured;
}

export function assertAdminWritesEnabled() {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const explicitlyEnabled = process.env.ADMIN_WRITES_ENABLED === 'true';

  if (!isProduction && !explicitlyEnabled) {
    throw new Error('Las escrituras administrativas todavía no están habilitadas en este entorno');
  }
}
