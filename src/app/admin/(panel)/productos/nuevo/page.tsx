import { Suspense } from 'react';
import { getAdminCategories } from '@/lib/repositories/admin';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NuevoProductoPage() {
  const categories = await getAdminCategories();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Cargando formulario...</div>}>
      <ProductForm categories={categories} />
    </Suspense>
  );
}
