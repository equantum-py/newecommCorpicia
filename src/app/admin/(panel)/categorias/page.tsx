import { getAdminCategories } from '@/lib/repositories/admin';
import CategoriesTable from '@/components/admin/CategoriesTable';
import { ConnectionNotice } from '@/components/admin/ConnectionNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <ConnectionNotice />
      <CategoriesTable categories={categories} />
    </div>
  );
}
