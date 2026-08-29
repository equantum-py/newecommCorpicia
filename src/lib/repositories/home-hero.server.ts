import 'server-only';

import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';
import { DEFAULT_HOME_HERO, type HomeHeroSettings } from '@/lib/repositories/home-hero';

export async function getHomeHeroSettings(): Promise<HomeHeroSettings> {
  if (!hasSupabaseAdminConfig()) return DEFAULT_HOME_HERO;

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'home_hero')
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_HOME_HERO;

    const value = data.value as Partial<HomeHeroSettings>;

    return {
      ...DEFAULT_HOME_HERO,
      ...value,
      mode: value.mode === 'banner' ? 'banner' : 'text',
      active: value.active ?? true,
      showTexts: value.showTexts ?? true,
    };
  } catch (error) {
    console.error('[Home Hero] Error loading settings:', error);
    return DEFAULT_HOME_HERO;
  }
}
