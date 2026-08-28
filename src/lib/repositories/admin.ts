import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';

export async function getAdminCategories() {
  if (!hasSupabaseAdminConfig()) return [];

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('Error fetching admin categories:', error.message);
    return [];
  }
  return data || [];
}

export async function getAdminProducts() {
  if (!hasSupabaseAdminConfig()) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name, slug), product_images(image_url, order_index)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin products:', error.message);
    return [];
  }
  return data || [];
}

export async function getAdminProduct(id: string) {
  if (!hasSupabaseAdminConfig()) return null;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_price_tiers(*), product_images(*), product_features(*), product_specifications(*), product_recommendations(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching admin product:', error.message);
    return null;
  }
  return data;
}

export async function getProductAuditData() {
  if (!hasSupabaseAdminConfig()) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      price_amount,
      unit,
      category_id,
      is_active,
      is_featured,
      seo_title,
      seo_description,
      seo_keywords,
      created_at,
      updated_at,
      categories(name, slug),
      product_images(id, image_url, alt_text, order_index),
      product_features(id, feature_text),
      product_specifications(id, spec_key, spec_value),
      product_recommendations(id, recommendation_text)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product audit data:', error.message);
    return [];
  }

  return data || [];
}
