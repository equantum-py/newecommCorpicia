import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

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

  // El panel no debe caerse completo si el entorno Preview no tiene
  // configuración Supabase válida. La lectura del perfil es secundaria.
  if (hasSupabaseConfig) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        userName = user.email || userName;

        try {
          const { data } = await supabase
            .from('admin_profiles')
            .select('name, role, email')
            .eq('user_id', user.id)
            .maybeSingle();

          const profile = data as AdminProfile | null;
          userName = profile?.name || profile?.email || userName;
          userRole = profile?.role || userRole;
        } catch (profileError) {
          console.warn('[admin-layout] Perfil administrativo no disponible:', profileError);
        }
      }
    } catch (error) {
      console.warn('[admin-layout] Supabase no disponible; panel continúa en modo seguro:', error);
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
