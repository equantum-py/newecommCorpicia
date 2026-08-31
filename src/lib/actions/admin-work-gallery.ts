'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizeWorkGalleryPhotos, type WorkGallerySettings } from '@/lib/repositories/work-gallery';

export async function saveWorkGallerySettings(data: WorkGallerySettings) {
  if (!supabaseAdmin) return { success: false, error: 'Supabase Admin no está configurado.' };
  try {
    const payload: WorkGallerySettings = {
      active: Boolean(data.active),
      eyebrow: String(data.eyebrow || '').trim(),
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      items: (Array.isArray(data.items) ? data.items : []).map(item => {
        const photos = normalizeWorkGalleryPhotos(item).slice(0, 20).map((photo, index) => ({ ...photo, order: index }));
        const requestedCover = String(item.image || '').trim();
        const afterPhoto = photos.find(photo => photo.stage === 'after')?.url;
        const cover = photos.some(photo => photo.url === requestedCover) ? requestedCover : (afterPhoto || photos[0]?.url || '');
        return {
          id: String(item.id || crypto.randomUUID()),
          title: String(item.title || '').trim(),
          category: String(item.category || '').trim(),
          location: String(item.location || '').trim(),
          description: String(item.description || '').trim(),
          image: cover,
          images: photos,
          active: item.active !== false,
        };
      }).filter(item => item.title && item.image).slice(0, 50),
    };
    const { error } = await supabaseAdmin.from('site_settings').upsert({ key: 'work_gallery', value: payload, is_public: true, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return { success: false, error: error.message };
    revalidatePath('/'); revalidatePath('/proyectos'); revalidatePath('/admin/galeria');
    return { success: true };
  } catch (error) { console.error('[Work Gallery] Save error:', error); return { success: false, error: 'No se pudo guardar la galería.' }; }
}

export async function uploadWorkGalleryImage(formData: FormData) {
  if (!supabaseAdmin) return { success: false, error: 'Supabase Admin no está configurado.' };
  try {
    const file = formData.get('file');
    if (!(file instanceof File)) return { success: false, error: 'No se recibió una imagen válida.' };
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { success: false, error: 'Solo JPG, PNG o WebP.' };
    if (file.size > 8 * 1024 * 1024) return { success: false, error: 'La imagen supera 8 MB.' };
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `work-gallery/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage.from('product-images').upload(path, buffer, { contentType: file.type, cacheControl: '31536000', upsert: false });
    if (error) return { success: false, error: error.message };
    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
    return { success: true, publicUrl: data.publicUrl };
  } catch (error) { console.error('[Work Gallery] Upload error:', error); return { success: false, error: 'No se pudo subir la imagen.' }; }
}
