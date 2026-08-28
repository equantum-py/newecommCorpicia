import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';
import { productsCatalog } from '@/data/productsData';

function mapStaticProductToAdmin(product: any) {
  const categoryName = String(product.category || '')
    .split('-')
    .filter(Boolean)
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    short_description: product.shortDescription || '',
    price_amount: product.pricePerM2 ?? product.price_amount ?? 0,
    unit: product.unit || 'unidad',
    min_order_quantity: product.minQuantity ?? product.min_order_quantity ?? 1,
    category_id: product.categoryId || product.category || null,
    is_active: product.isActive !== false,
    is_featured: product.isFeatured === true,
    seo_title: product.seoTitle || product.name,
    seo_description: product.seoDescription || product.shortDescription || '',
    seo_keywords: product.seoKeywords || [],
    created_at: product.createdAt || null,
    updated_at: product.updatedAt || null,
    categories: categoryName ? { name: categoryName, slug: product.category } : null,
    product_images: (product.images || []).map((imageUrl: string, index: number) => ({ image_url: imageUrl, order_index: index })),
    product_price_tiers: (product.priceTiers || []).map((tier: any, index: number) => ({
      id: `static-tier-${product.id}-${index}`,
      min_quantity: tier.minQuantity ?? tier.min ?? 1,
      max_quantity: tier.maxQuantity ?? tier.max ?? null,
      price_amount: tier.price,
      label: tier.label,
      is_promo: tier.isPromo ?? tier.is_promo ?? false,
      order_index: index,
    })),
    product_features: (product.features || []).map((feature: string, index: number) => ({ feature_text: feature, order_index: index })),
    product_specifications: Object.entries(product.specifications || {}).map(([key, value], index) => ({ spec_key: key, spec_value: String(value), order_index: index })),
    product_recommendations: (product.recommendations || []).map((recommendation: string, index: number) => ({ recommendation_text: recommendation, order_index: index })),
    _source: 'existing-catalog',
  };
}

const existingCatalog = productsCatalog.map(mapStaticProductToAdmin);

async function getReadClient() {
  try {
    const client = createClient();
    const { data: authData } = await client.auth.getUser();
    if (authData?.user) return client;
  } catch (error) {
    console.error('[Admin Repository] Authenticated Supabase client unavailable:', error);
  }

  return hasSupabaseAdminConfig() ? supabaseAdmin : null;
}

function getStaticCategories() {
  const categories = new Map<string, any>();
  existingCatalog.forEach((product: any) => {
    if (product.categories?.slug) {
      categories.set(product.categories.slug, {
        id: product.category_id || product.categories.slug,
        name: product.categories.name,
        slug: product.categories.slug,
        is_active: true,
      });
    }
  });
  return Array.from(categories.values());
}

export async function getAdminCategories() {
  const supabase = await getReadClient();
  if (!supabase) return getStaticCategories();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching admin categories:', error.message);
      return getStaticCategories();
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return getStaticCategories();
  }
}

export async function getAdminProducts() {
  const supabase = await getReadClient();
  if (!supabase) return existingCatalog;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(image_url, order_index), product_price_tiers(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching full admin catalog:', error.message);
      return existingCatalog;
    }

    if (!data || data.length === 0) {
      console.warn('[Admin Repository] Supabase returned zero products; showing existing catalog fallback.');
      return existingCatalog;
    }

    return data;
  } catch (error) {
    console.error('Error fetching full admin catalog:', error);
    return existingCatalog;
  }
}

export async function getAdminProduct(id: string) {
  const supabase = await getReadClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_price_tiers(*), product_images(*), product_features(*), product_specifications(*), product_recommendations(*)')
        .eq('id', id)
        .single();

      if (!error && data) return data;
      if (error) console.error('Error fetching admin product:', error.message);
    } catch (error) {
      console.error('Error fetching admin product:', error);
    }
  }

  return existingCatalog.find((product: any) => String(product.id) === String(id)) || null;
}

export async function getProductAuditData() {
  const supabase = await getReadClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
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

      if (!error && data?.length) return data;
      if (error) console.error('Error fetching product audit data:', error.message);
    } catch (error) {
      console.error('Error fetching product audit data:', error);
    }
  }

  return existingCatalog;
}
