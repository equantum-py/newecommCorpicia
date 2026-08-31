import { WorkGalleryEditor } from '@/components/admin/WorkGalleryEditor';
import { getWorkGallerySettings } from '@/lib/repositories/work-gallery.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminGaleriaPage() {
  const settings = await getWorkGallerySettings();
  return <WorkGalleryEditor initial={settings} />;
}
