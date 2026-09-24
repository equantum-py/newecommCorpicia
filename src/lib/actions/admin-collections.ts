'use server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function saveCollection(formData: FormData) {
  try {
    const id=String(formData.get('id')||'');
    const title=String(formData.get('title')||'').trim();
    const slug=String(formData.get('slug')||'').trim();
    if(!title||!slug) return {success:false,message:'Título y slug son obligatorios.'};
    const payload={title,slug,description:String(formData.get('description')||''),is_active:formData.get('is_active')==='true',show_on_home:formData.get('show_on_home')==='true',home_order_index:Number(formData.get('home_order_index')||0)||null,sort_mode:String(formData.get('sort_mode')||'manual')};
    const q=(supabaseAdmin as any).from('product_collections');
    const {data,error}=id?await q.update(payload).eq('id',id).select('id').single():await q.insert(payload).select('id').single();
    if(error) throw error;
    revalidatePath('/admin/colecciones'); revalidatePath('/');
    return {success:true,id:data.id};
  } catch(e:any){return {success:false,message:e.message||'No se pudo guardar la colección.'}}
}

export async function saveCollectionProducts(collectionId:string, productIds:string[]) {
  try {
    const table=(supabaseAdmin as any).from('product_collection_items');
    const {error:del}=await table.delete().eq('collection_id',collectionId); if(del) throw del;
    if(productIds.length){const rows=productIds.map((product_id,order_index)=>({collection_id:collectionId,product_id,order_index:order_index+1}));const {error}=await table.insert(rows);if(error)throw error;}
    revalidatePath('/admin/colecciones'); revalidatePath('/'); return {success:true};
  } catch(e:any){return {success:false,message:e.message||'No se pudo guardar el orden.'}}
}

export async function deleteCollection(id:string){
 try{const {error}=await (supabaseAdmin as any).from('product_collections').delete().eq('id',id);if(error)throw error;revalidatePath('/admin/colecciones');revalidatePath('/');return{success:true};}
 catch(e:any){return{success:false,message:e.message||'No se pudo eliminar.'}}
}
