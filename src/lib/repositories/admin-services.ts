import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabase/admin';

const DEFAULT_ADMIN_SERVICES = [
  { title: 'Instalación de césped', slug: 'instalacion-de-cesped', description: 'Preparación y colocación profesional de césped natural.', order_index: 2, is_active: true },
  { title: 'Riego automático', slug: 'riego-automatico', description: 'Diseño e instalación de sistemas de riego.', order_index: 3, is_active: true },
  { title: 'Paisajismo', slug: 'paisajismo', description: 'Diseño y ejecución de espacios verdes.', order_index: 4, is_active: true },
  { title: 'Mantenimiento', slug: 'mantenimiento-de-jardines', description: 'Cuidado periódico de tu espacio verde.', order_index: 5, is_active: true },
];

async function ensureDefaultServices() {
  const { data: existing, error } = await (supabaseAdmin as any).from('services').select('slug');
  if (error) throw error;
  const slugs = new Set((existing || []).map((item: any) => item.slug));
  const missing = DEFAULT_ADMIN_SERVICES.filter((item) => !slugs.has(item.slug));
  if (missing.length > 0) {
    const { error: insertError } = await (supabaseAdmin as any).from('services').insert(missing);
    if (insertError) throw insertError;
  }
}

export async function getAdminServices() {
  if (!hasSupabaseAdminConfig()) return [];
  try {
    await ensureDefaultServices();
    const { data, error } = await (supabaseAdmin as any).from('services').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching admin services:', error); return []; }
    return data || [];
  } catch (error) { console.error('Error fetching admin services:', error); return []; }
}

export async function getAdminService(id: string) {
  if (!hasSupabaseAdminConfig()) return null;
  try {
    const { data, error } = await (supabaseAdmin as any).from('services').select('*').eq('id', id).single();
    if (error) { console.error('Error fetching admin service:', error); return null; }
    return data;
  } catch (error) { console.error('Error fetching admin service:', error); return null; }
}

export async function createAdminService(serviceData: any) {
  if (!hasSupabaseAdminConfig()) throw new Error('Supabase Admin no está configurado en este entorno');
  const { data, error } = await (supabaseAdmin as any).from('services').insert([serviceData]).select().single();
  if (error) { console.error('Error creating service:', error); throw error; }
  return data;
}

export async function updateAdminService(id: string, serviceData: any) {
  if (!hasSupabaseAdminConfig()) throw new Error('Supabase Admin no está configurado en este entorno');
  const { data, error } = await (supabaseAdmin as any).from('services').update(serviceData).eq('id', id).select().single();
  if (error) { console.error('Error updating service:', error); throw error; }
  return data;
}

export async function deleteAdminService(id: string) {
  if (!hasSupabaseAdminConfig()) throw new Error('Supabase Admin no está configurado en este entorno');
  const { error } = await (supabaseAdmin as any).from('services').delete().eq('id', id);
  if (error) { console.error('Error deleting service:', error); throw error; }
  return true;
}

export async function toggleAdminServiceStatus(id: string, currentStatus: boolean) {
  if (!hasSupabaseAdminConfig()) throw new Error('Supabase Admin no está configurado en este entorno');
  const { data, error } = await (supabaseAdmin as any).from('services').update({ is_active: !currentStatus }).eq('id', id).select().single();
  if (error) { console.error('Error toggling service status:', error); throw error; }
  return data;
}
