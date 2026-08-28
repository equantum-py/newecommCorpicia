import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabase/admin';

export async function getAdminServices() {
  if (!hasSupabaseAdminConfig()) return [];
  try {
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
