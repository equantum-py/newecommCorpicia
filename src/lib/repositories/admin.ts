import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin, hasSupabaseAdminConfig } from '@/lib/supabase/admin';

async function getAuthenticatedClient() {
  try {
    const client = createClient();
    const { data, error } = await client.auth.getUser();
    if (!error && data?.user) return client;
  } catch (error) {
    console.error('[Admin Repository] Auth client unavailable:', error);
  }
  return null;
}

async function getAdminReadClients() {
  const clients: any[] = [];
  if (hasSupabaseAdminConfig()) clients.push(supabaseAdmin);
  const authClient = await getAuthenticatedClient();
  if (authClient) clients.push(authClient);
  return clients;
}

export async function getAdminCategories() {
  const clients = await getAdminReadClients();
  let lastError = 'No Supabase client available';

  for (const supabase of clients) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    if (!error && data) return data;
    lastError = error?.message || lastError;
  }

  console.error('[Admin Repository] Categories unavailable:', lastError);
  return [];
}

async function hydrateProducts(supabase: any, products: any[]) {
  if (!products.length) return products;

  const ids = products.map((p) => p.id);
  const categoryIds = Array.from(new Set(products.map((p) => p.category_id).filter(Boolean)));

  const [imagesResult, categoriesResult] = await Promise.all([
    supabase
      .from('product_images')
      .select('product_id, image_url, order_index')
      .in('product_id', ids)
      .order('order_index'),
    categoryIds.length
      ? supabase.from('categories').select('id, name, slug').in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const imagesByProduct = new Map<string, any[]>();
  if (!imagesResult.error) {
    for (const image of imagesResult.data || []) {
      const current = imagesByProduct.get(image.product_id) || [];
      current.push(image);
      imagesByProduct.set(image.product_id, current);
    }
  }

  const categoryById = new Map<string, any>();
  if (!categoriesResult.error) {
    for (const category of categoriesResult.data || []) categoryById.set(category.id, category);
  }

  return products.map((product) => ({
    ...product,
    categories: product.category_id ? categoryById.get(product.category_id) || null : null,
    product_images: imagesByProduct.get(product.id) || [],
  }));
}

export async function getAdminProducts() {
  const clients = await getAdminReadClients();
  let lastError = 'No Supabase client available';

  for (const supabase of clients) {
    // Primero usamos la consulta exacta del panel viejo.
    const legacyQuery = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(image_url, order_index)')
      .order('created_at', { ascending: false });

    if (!legacyQuery.error && legacyQuery.data?.length) {
      console.info(`[Admin Repository] Live catalog loaded with legacy query: ${legacyQuery.data.length} products.`);
      return legacyQuery.data;
    }

    lastError = legacyQuery.error?.message || lastError;
    console.warn('[Admin Repository] Legacy joined query failed, retrying base products query:', lastError);

    // Si una relación/RLS rompe el join, recuperamos primero TODOS los productos
    // y después hidratamos imágenes/categorías por separado.
    const baseQuery = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!baseQuery.error && baseQuery.data?.length) {
      const hydrated = await hydrateProducts(supabase, baseQuery.data);
      console.info(`[Admin Repository] Live catalog loaded with base query: ${hydrated.length} products.`);
      return hydrated;
    }

    lastError = baseQuery.error?.message || lastError;
  }

  // Nunca volver a mostrar silenciosamente los 14 productos estáticos en el administrador.
  // Es preferible exponer el fallo real antes que hacer creer que el catálogo tiene 14 registros.
  console.error('[Admin Repository] FULL CATALOG LOAD FAILED:', lastError);
  throw new Error(`No se pudo cargar el catálogo administrativo real: ${lastError}`);
}

export async function getAdminProduct(id: string) {
  const clients = await getAdminReadClients();
  let lastError = 'No Supabase client available';

  for (const supabase of clients) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_price_tiers(*), product_images(*), product_features(*), product_specifications(*), product_recommendations(*)')
      .eq('id', id)
      .single();

    if (!error && data) return data;
    lastError = error?.message || lastError;
  }

  console.error('[Admin Repository] Product load failed:', id, lastError);
  return null;
}

export async function getProductAuditData() {
  const clients = await getAdminReadClients();
  let lastError = 'No Supabase client available';

  for (const supabase of clients) {
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
    lastError = error?.message || lastError;
  }

  console.error('[Admin Repository] Audit data unavailable:', lastError);
  return [];
}
