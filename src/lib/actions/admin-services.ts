'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '../supabase/admin';
import { 
  createAdminService, 
  updateAdminService, 
  deleteAdminService, 
  toggleAdminServiceStatus 
} from '../repositories/admin-services';

const ADMIN_WRITES_ENABLED = process.env.ADMIN_WRITES_ENABLED === 'true';

export async function createServiceAction(formData: FormData) {
  if (!ADMIN_WRITES_ENABLED) {
    return { success: false, error: 'La creación de servicios está deshabilitada en este entorno.' };
  }

  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const image_url = formData.get('image_url') as string;
    const order_index = parseInt(formData.get('order_index') as string || '0', 10);
    const is_active = formData.get('is_active') === 'true';

    if (!title || !slug) {
      return { success: false, error: 'El título y el slug son obligatorios.' };
    }

    const serviceData = {
      title,
      slug,
      description,
      image_url,
      order_index,
      is_active,
    };

    await createAdminService(serviceData);
    revalidatePath('/admin/servicios');
    revalidatePath('/servicios');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el servicio' };
  }
}

export async function updateServiceAction(id: string, formData: FormData) {
  if (!ADMIN_WRITES_ENABLED) {
    return { success: false, error: 'La edición de servicios está deshabilitada en este entorno.' };
  }

  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const image_url = formData.get('image_url') as string;
    const order_index = parseInt(formData.get('order_index') as string || '0', 10);
    const is_active = formData.get('is_active') === 'true';

    if (!title || !slug) {
      return { success: false, error: 'El título y el slug son obligatorios.' };
    }

    const serviceData = {
      title,
      slug,
      description,
      image_url,
      order_index,
      is_active,
    };

    await updateAdminService(id, serviceData);
    revalidatePath('/admin/servicios');
    revalidatePath('/servicios');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el servicio' };
  }
}

export async function deleteServiceAction(id: string) {
  if (!ADMIN_WRITES_ENABLED) {
    return { success: false, error: 'La eliminación de servicios está deshabilitada en este entorno.' };
  }

  try {
    await deleteAdminService(id);
    revalidatePath('/admin/servicios');
    revalidatePath('/servicios');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar el servicio' };
  }
}

export async function toggleServiceStatusAction(id: string, currentStatus: boolean) {
  if (!ADMIN_WRITES_ENABLED) {
    return { success: false, error: 'La edición de servicios está deshabilitada en este entorno.' };
  }

  try {
    await toggleAdminServiceStatus(id, currentStatus);
    revalidatePath('/admin/servicios');
    revalidatePath('/servicios');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al cambiar el estado' };
  }
}


const SERVICE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const SERVICE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadServiceImageAction(formData: FormData) {
  if (!ADMIN_WRITES_ENABLED) {
    return { success: false, error: 'La carga de imágenes está deshabilitada en este entorno.' };
  }

  try {
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'Seleccioná una imagen.' };
    }

    if (!SERVICE_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: 'La imagen debe ser JPG, PNG o WebP.' };
    }

    if (file.size > SERVICE_IMAGE_MAX_SIZE) {
      return { success: false, error: 'La imagen supera el máximo permitido de 5 MB.' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'servicio';
    const filePath = `services/${baseName}-${Date.now()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'No se pudo subir la imagen.' };
  }
}
