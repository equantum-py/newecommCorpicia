import { getAdminProducts } from '@/lib/repositories/admin';
import ProductsTable from '@/components/admin/ProductsTable';
import { ConnectionNotice } from '@/components/admin/ConnectionNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminProductosPage() {
  const products = await getAdminProducts();
  const sortedProducts = [...products].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  return (
    <div className="space-y-6">
      <ConnectionNotice />
      <ProductsTable products={sortedProducts} />
    </div>
  );
}
