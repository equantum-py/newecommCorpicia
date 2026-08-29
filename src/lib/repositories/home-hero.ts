import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';

export type HomeHeroSettings = {
  active: boolean;
  mode: 'text' | 'banner';
  showTexts: boolean;
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  desktopImage: string;
  mobileImage: string;
};

export const DEFAULT_HOME_HERO: HomeHeroSettings = {
  active: true,
  mode: 'text',
  showTexts: true,
  eyebrow: 'Especialistas en espacios verdes en Paraguay',
  title: 'Césped natural, paisajismo y riego automático',
  description: 'Venta, instalación y asesoramiento profesional para hogares, empresas y proyectos.',
  primaryButton: 'Cotizar proyecto',
  secondaryButton: 'Ver productos',
  desktopImage: '',
  mobileImage: '',
};

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
