'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

export type ActionState = {
  success: boolean;
  message: string;
};

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type TierInsert = Database['public']['Tables']['product_price_tiers']['Insert'];
type FeatureInsert = Database['public']['Tables']['product_features']['Insert'];
type SpecInsert = Database['public']['Tables']['product_specifications']['Insert'];
type RecInsert = Database['public']['Tables']['product_recommendations']['Insert'];
type ImageInsert = Database['public']['Tables']['product_images']['Insert'];

// Types for complex data passed as JSON strings in FormData
export type PriceTierPayload = {
  min_quantity: number;
  max_quantity: number | null;
  price: number;
  label: string;
  is_promo: boolean;
};

export type FeaturePayload = {
  feature_text: string;
};

export type SpecificationPayload = {
  spec_key: string;
  spec_value: string;
};

export type RecommendationPayload = {
  recommendation_text: string;
};

export type ImagePayload = {
  image_url: string;
  is_main: boolean;
};

export async function syncProductRelations(productId: string, formData: FormData, supabase: any) {
  const tiersJson = formData.get('price_tiers') as string;
  const featuresJson = formData.get('features') as string;
  const specsJson = formData.get('specifications') as string;
  const recsJson = formData.get('recommendations') as string;
  const imagesJson = formData.get('images') as string;

  const features: FeatureInsert[] = featuresJson ? JSON.parse(featuresJson) : [];
  const specs: SpecInsert[] = specsJson ? JSON.parse(specsJson) : [];
  const recs: RecInsert[] = recsJson ? JSON.parse(recsJson) : [];
  const images: ImageInsert[] = imagesJson ? JSON.parse(imagesJson) : [];

  // Tiers
  if (formData.has('price_tiers') && tiersJson) {
    try {
      const tiers: PriceTierPayload[] = JSON.parse(tiersJson);
      if (Array.isArray(tiers)) {
        const tiersPayload = tiers.map((t: any) => ({
          product_id: productId,
          min_quantity: Number(t.minQuantity ?? t.min_quantity),
          max_quantity:
            (t.maxQuantity ?? t.max_quantity) === null || (t.maxQuantity ?? t.max_quantity) === undefined || (t.maxQuantity ?? t.max_quantity) === ''
              ? null
              : Number(t.maxQuantity ?? t.max_quantity),
          price_amount: Number(t.price ?? t.price_amount),
          label: t.label || '',
          is_promo: Boolean(t.isPromo ?? t.is_promo),
        }));

        // Validate payload before proceeding
        const isValid = tiersPayload.every(t => !isNaN(t.min_quantity) && !isNaN(t.price_amount));
        
        if (isValid) {
          const tiersTable = supabase.from('product_price_tiers') as any;
          await tiersTable.delete().eq('product_id', productId);
          
          if (tiersPayload.length > 0) {
            const { error: insertError } = await tiersTable.insert(tiersPayload);
            if (insertError) {
              console.error('Error inserting tiers:', insertError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing tiers payload:', err);
    }
  }

  // Features
  const featuresTable = supabase.from('product_features') as any;
  await featuresTable.delete().eq('product_id', productId);
  if (features.length > 0) {
    const featuresPayload: FeatureInsert[] = features.map((f, i) => ({
      product_id: productId,
      feature_text: f.feature_text,
      order_index: i,
    }));
    await featuresTable.insert(featuresPayload);
  }

  // Specifications
  const specsTable = supabase.from('product_specifications') as any;
  await specsTable.delete().eq('product_id', productId);
  if (specs.length > 0) {
    const specsPayload: SpecInsert[] = specs.map((s, i) => ({
      product_id: productId,
      spec_key: s.spec_key,
      spec_value: s.spec_value,
      order_index: i,
    }));
    await specsTable.insert(specsPayload);
  }

  // Recommendations
  const recsTable = supabase.from('product_recommendations') as any;
  await recsTable.delete().eq('product_id', productId);
  if (recs.length > 0) {
    const recsPayload: RecInsert[] = recs.map((r, i) => ({
      product_id: productId,
      recommendation_text: r.recommendation_text,
      order_index: i,
    }));
    await recsTable.insert(recsPayload);
  }

  // Images
  const imagesTable = supabase.from('product_images') as any;
  await imagesTable.delete().eq('product_id', productId);
  if (images.length > 0) {
    const imagesPayload: ImageInsert[] = images.map((img, i) => ({
      product_id: productId,
      image_url: img.image_url,
      alt_text: img.alt_text || null,
      order_index: (img as any).is_main ? 0 : (i + 1),
    }));
    await imagesTable.insert(imagesPayload);
  }
}

export async function createProduct(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No autorizado. Inicie sesión.' };
    }

    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || null;
    const short_description = (formData.get('short_description') as string) || null;
    const seo_title = (formData.get('seo_title') as string)?.trim() || null;
    const seo_description =
      (formData.get('seo_description') as string)?.trim() || null;
    const seo_keywords_raw =
      (formData.get('seo_keywords') as string)?.trim() || '';
    const seo_keywords = seo_keywords_raw
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, 12);
    const category_id = formData.get('category_id') as string;
    
    const priceAmountRaw = formData.get('price_amount');
    const price_amount = priceAmountRaw ? Number(priceAmountRaw) : NaN;
    
    const unit = formData.get('unit') as string;
    const min_order_quantity = parseInt(formData.get('min_order_quantity') as string);
    const is_active = formData.get('is_active') === 'true';
    const is_featured = formData.get('is_featured') === 'true';

    if (!name || !slug || !unit || !Number.isFinite(price_amount) || price_amount < 0 || min_order_quantity <= 0) {
      return { success: false, message: 'Datos obligatorios faltantes o inválidos' };
    }

    const payload: ProductInsert = {
      name,
      slug,
      description,
      short_description,
      seo_title,
      seo_description,
      seo_keywords,
      category_id: category_id || null,
      price_amount,
      currency: 'PYG',
      unit,
      min_order_quantity,
      is_active,
      is_featured,
    };

    // Insert Product
    const productsTable = supabaseAdmin.from('products') as any;
    const { data: product, error } = await productsTable.insert(payload).select('id').single();

    if (error) {
      if (error.code === '23505') return { success: false, message: 'El slug ya existe' };
      throw error;
    }

    // Sync Relations
    await syncProductRelations(product.id, formData, supabase);

    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    return { success: true, message: 'Producto creado exitosamente' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Ocurrió un error inesperado' };
  }
}

export async function updateProduct(
  id: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No autorizado. Inicie sesión.' };
    }

    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || null;
    const short_description = (formData.get('short_description') as string) || null;
    const seo_title = (formData.get('seo_title') as string)?.trim() || null;
    const seo_description =
      (formData.get('seo_description') as string)?.trim() || null;
    const seo_keywords_raw =
      (formData.get('seo_keywords') as string)?.trim() || '';
    const seo_keywords = seo_keywords_raw
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, 12);
    const category_id = formData.get('category_id') as string;
    
    const priceAmountRaw = formData.get('price_amount');
    const price_amount = priceAmountRaw ? Number(priceAmountRaw) : NaN;
    
    const unit = formData.get('unit') as string;
    const min_order_quantity = parseInt(formData.get('min_order_quantity') as string);
    const is_active = formData.get('is_active') === 'true';
    const is_featured = formData.get('is_featured') === 'true';

    if (!name || !slug || !unit || !Number.isFinite(price_amount) || price_amount < 0 || min_order_quantity <= 0) {
      return { success: false, message: 'Datos obligatorios faltantes o inválidos' };
    }

    const payload: ProductUpdate = {
      name,
      slug,
      description,
      short_description,
      seo_title,
      seo_description,
      seo_keywords,
      category_id: category_id || null,
      price_amount,
      unit,
      min_order_quantity,
      is_active,
      is_featured,
    };

    const productsTable = supabaseAdmin.from('products') as any;
    const { error } = await productsTable
      .update(payload)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') return { success: false, message: 'El slug ya existe' };
      throw error;
    }

    await syncProductRelations(id, formData, supabaseAdmin);

    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    revalidatePath(`/productos/${slug}`);
    return { success: true, message: 'Producto actualizado exitosamente' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Ocurrió un error inesperado' };
  }
}

export async function deleteProduct(id: string): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No autorizado. Inicie sesión.' };
    }

    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    // Checking if there are historical dependencies (quotes)
    const quoteItemsTable = supabase.from('quote_items') as any;
    const { count, error: countError } = await quoteItemsTable
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id);

    if (countError) {
      // If table doesn't exist yet or query fails, just proceed to delete
      console.warn('Error checking quote_items dependencies (may not exist yet):', countError);
    } else if (count && count > 0) {
      return { 
        success: false, 
        message: `No se puede eliminar físicamente este producto porque aparece en ${count} presupuesto(s) histórico(s). Se recomienda desactivarlo.`
      };
    }

    const productsTable = supabaseAdmin.from('products') as any;
    const { error } = await productsTable.delete().eq('id', id);

    if (error) {
      if (error.code === '23503') { // foreign key violation
        return { success: false, message: 'No se puede eliminar. El producto está en presupuestos históricos. Desactívelo en su lugar.' };
      }
      throw error;
    }

    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, message: 'Producto eliminado exitosamente' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al eliminar producto' };
  }
}

export async function duplicateProduct(id: string): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No autorizado. Inicie sesión.' };
    }

    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    // Fetch original slug
    const productsTable = supabaseAdmin.from('products') as any;
    const { data: original, error: origError } = await productsTable
      .select('slug')
      .eq('id', id)
      .single();

    if (origError || !original) {
      return { success: false, message: 'Producto original no encontrado' };
    }

    const newSlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;
    
    // Call transactional RPC
    const { error: rpcError } = await (supabase as any).rpc('duplicate_product', {
      original_product_id: id,
      new_slug: newSlug
    });

    if (rpcError) throw rpcError;

    revalidatePath('/admin/productos');
    return { success: true, message: 'Producto duplicado exitosamente' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al duplicar producto' };
  }
}

export async function toggleProductStatus(id: string, newStatus: boolean): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No autorizado. Inicie sesión.' };
    }

    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    const productsTable = supabaseAdmin.from('products') as any;
    const { error } = await productsTable
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, message: 'Estado del producto actualizado' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al actualizar estado' };
  }
}


export async function updateHomeProductOrder(productIds: string[]): Promise<ActionState> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'No autorizado. Inicie sesión.' };
    if (process.env.ADMIN_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'Las escrituras están deshabilitadas en este entorno.' };
    }

    const cleanIds = Array.from(new Set(productIds.filter(Boolean)));
    if (cleanIds.length > 12) {
      return { success: false, message: 'El Home admite hasta 12 productos ordenados.' };
    }

    const productsTable = supabaseAdmin.from('products') as any;
    const { error: clearError } = await productsTable
      .update({ home_order_index: null })
      .not('home_order_index', 'is', null);
    if (clearError) throw clearError;

    for (let index = 0; index < cleanIds.length; index += 1) {
      const { error } = await productsTable
        .update({ home_order_index: index + 1 })
        .eq('id', cleanIds[index]);
      if (error) throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/productos');
    return { success: true, message: 'Orden del Home actualizado.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'No se pudo guardar el orden del Home.' };
  }
}
