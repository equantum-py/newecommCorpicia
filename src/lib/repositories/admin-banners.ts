import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';

export async function getAdminBanners() {
  if (!hasSupabaseAdminConfig()) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin banners:', error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    return [];
  }
}
