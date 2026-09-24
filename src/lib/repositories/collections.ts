import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getAdminCollections() {
  const { data, error } = await (supabaseAdmin as any).from('product_collections').select('*, product_collection_items(product_id, order_index)').order('home_order_index', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
  if (error) { console.error('Collections:', error.message); return []; }
  return data || [];
}

export async function getAdminCollection(id: string) {
  const { data, error } = await (supabaseAdmin as any).from('product_collections').select('*, product_collection_items(product_id, order_index)').eq('id', id).single();
  if (error) return null;
  if (data?.product_collection_items) data.product_collection_items.sort((a:any,b:any)=>a.order_index-b.order_index);
  return data;
}

export async function getHomeCollections() {
  const { data, error } = await (supabaseAdmin as any).from('product_collections').select('*, product_collection_items(order_index, products(*, categories(name,slug), product_images(image_url,order_index)))').eq('is_active', true).eq('show_on_home', true).order('home_order_index', { ascending: true });
  if (error) { console.error('Home collections:', error.message); return []; }
  return data || [];
}
