import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/server';

type AdminProfile = {
  name?: string | null;
  role?: string | null;
  email?: string | null;
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!hasSupabaseConfig) redirect('/admin/login?error=configuration');

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect('/admin/login?next=/admin/inicio');

  let profile: AdminProfile | null = null;
  try {
    const { data } = await supabase
      .from('admin_profiles')
      .select('name, role, email')
      .eq('user_id', user.id)
      .maybeSingle();
    profile = data as AdminProfile | null;
  } catch (error) {
    console.error('[admin-layout] Could not load admin profile:', error);
  }

  const userName = profile?.name || user.email || 'Administrador';
  const userRole = profile?.role || 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
