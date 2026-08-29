'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { HomeHeroSettings } from '@/lib/repositories/home-hero';

export async function saveHomeHeroSettings(data: HomeHeroSettings) {
  if (!supabaseAdmin) return { success: false, error: 'Supabase Admin no está configurado.' };

  try {
    const payload: HomeHeroSettings = {
      active: Boolean(data.active),
      mode: data.mode === 'banner' ? 'banner' : 'text',
      showTexts: Boolean(data.showTexts),
      eyebrow: String(data.eyebrow || '').trim(),
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      primaryButton: String(data.primaryButton || '').trim(),
      secondaryButton: String(data.secondaryButton || '').trim(),
      desktopImage: String(data.desktopImage || ''),
      mobileImage: String(data.mobileImage || ''),
    };

    if (payload.mode === 'banner' && !payload.desktopImage) {
      return { success: false, error: 'Cargá una imagen desktop antes de guardar el modo Banner.' };
    }

    const { error } = await supabaseAdmin.from('site_settings').upsert({
      key: 'home_hero',
      value: payload,
      is_public: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

    if (error) return { success: false, error: error.message };

    revalidatePath('/');
    revalidatePath('/admin/configuracion');
    return { success: true };
  } catch (error) {
    console.error('[Home Hero] Save error:', error);
    return { success: false, error: 'No se pudo guardar la portada.' };
  }
}

export async function uploadHomeHeroImage(formData: FormData) {
  if (!supabaseAdmin) return { success: false, error: 'Supabase Admin no está configurado.' };
  try {
    const file = formData.get('file');
    const target = formData.get('target') === 'mobile' ? 'mobile' : 'desktop';
    if (!(file instanceof File)) return { success: false, error: 'No se recibió una imagen válida.' };
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return { success: false, error: 'Solo JPG, PNG o WebP.' };
    if (file.size > 5 * 1024 * 1024) return { success: false, error: 'La imagen supera 5 MB.' };

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `home-hero/${target}-${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage.from('product-images').upload(path, buffer, {
      contentType: file.type, cacheControl: '31536000', upsert: false,
    });
    if (error) return { success: false, error: error.message };
    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
    return { success: true, publicUrl: data.publicUrl };
  } catch (error) {
    console.error('[Home Hero] Upload error:', error);
    return { success: false, error: 'No se pudo subir la imagen.' };
  }
}
