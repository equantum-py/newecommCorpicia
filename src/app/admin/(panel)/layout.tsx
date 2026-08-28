import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/server';

type AdminProfile = {
  name?: string | null;
  role?: string | null;
  email?: string | null;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName = 'Administrador';
  let userRole = 'admin';

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (hasSupabaseConfig) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let profile: AdminProfile | null = null;

      if (user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('name, role, email')
          .eq('user_id', user.id)
          .maybeSingle();

        profile = data as AdminProfile | null;
      }

      userName = profile?.name || user?.email || userName;
      userRole = profile?.role || userRole;
    } catch (error) {
      console.error('[admin-layout] Supabase unavailable in this deployment:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
