import 'server-only';

import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';
import { DEFAULT_WORK_GALLERY, type WorkGallerySettings } from '@/lib/repositories/work-gallery';

export async function getWorkGallerySettings(): Promise<WorkGallerySettings> {
  if (!hasSupabaseAdminConfig()) return DEFAULT_WORK_GALLERY;
  try {
    const { data, error } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'work_gallery').maybeSingle();
    if (error || !data?.value) return DEFAULT_WORK_GALLERY;
    const value = data.value as Partial<WorkGallerySettings>;
    return {
      ...DEFAULT_WORK_GALLERY,
      ...value,
      active: value.active ?? true,
      items: Array.isArray(value.items) ? value.items : [],
    };
  } catch (error) {
    console.error('[Work Gallery] Error loading settings:', error);
    return DEFAULT_WORK_GALLERY;
  }
}
