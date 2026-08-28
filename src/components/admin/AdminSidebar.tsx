'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Megaphone,
  Wrench,
  Users,
  Image as ImageIcon,
  Package,
  Tags,
  ShoppingCart,
  Calculator,
  Globe,
  Settings,
  UserCircle,
  Activity,
  LineChart,
  BriefcaseBusiness,
  BellRing,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    group: 'Inicio',
    items: [
      { name: 'Dashboard', href: '/admin/inicio', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Contenido web',
    items: [
      { name: 'Inicio / Home', href: '/admin/inicio#contenido-home', icon: Home },
      { name: 'Promociones', href: '/admin/banners', icon: Megaphone },
      { name: 'Servicios', href: '/admin/servicios', icon: Wrench },
      { name: 'CTA Profesionales', href: '/admin/cta-profesionales', icon: BriefcaseBusiness },
      { name: 'Multimedia', href: '/admin/multimedia', icon: ImageIcon },
    ],
  },
  {
    group: 'Catálogo',
    items: [
      { name: 'Productos', href: '/admin/productos', icon: Package },
      { name: 'Categorías', href: '/admin/categorias', icon: Tags },
    ],
  },
  {
    group: 'Comercial',
    items: [
      { name: 'Presupuestos', href: '/admin/presupuestos', icon: ShoppingCart },
      { name: 'Clientes', href: '/admin/clientes', icon: Users },
      { name: 'Calculadora de m²', href: '/admin/calculadora', icon: Calculator },
      { name: 'Dashboard comercial', href: '/admin/dashboard-comercial', icon: LineChart },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { name: 'SEO', href: '/admin/seo', icon: Globe },
      { name: 'Anuncios / Pop Up', href: '/admin/announcements', icon: BellRing },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { name: 'Usuarios', href: '/admin/usuarios', icon: UserCircle },
      { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
      { name: 'Actividad', href: '/admin/actividad', icon: Activity },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 min-h-screen h-screen sticky top-0 flex-col border-r bg-white overflow-y-auto">
      <div className="border-b px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-corpicia-green text-white font-black text-lg">C</div>
          <div>
            <h2 className="text-lg font-bold text-gray-950 leading-tight">CORPICIA</h2>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-corpicia-green">Panel administrativo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <h3 className="px-3 text-[11px] font-bold text-corpicia-green uppercase tracking-[0.12em] mb-2">
              {group.group}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const pathOnly = item.href.split('#')[0];
                const isActive = pathname === pathOnly || (pathOnly !== '/admin/inicio' && pathname?.startsWith(pathOnly));
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-corpicia-green/10 text-corpicia-green'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-corpicia-green' : 'text-gray-400')} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-xl border bg-gray-50 p-3">
          <p className="text-sm font-semibold text-gray-900">¿Necesitás ayuda?</p>
          <p className="mt-1 text-xs text-gray-500">Usá la vista previa antes de publicar cambios importantes.</p>
        </div>
      </div>
    </aside>
  );
}
