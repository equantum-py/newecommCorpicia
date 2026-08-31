'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Megaphone, Package, ShoppingCart, Wrench, MoreHorizontal, Eye, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryItems = [
  { name: 'Inicio', href: '/admin/inicio', icon: Home },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Promociones', href: '/admin/banners', icon: Megaphone },
  { name: 'Servicios', href: '/admin/servicios', icon: Wrench },
  { name: 'Galería', href: '/admin/galeria', icon: ImageIcon },
  { name: 'Presupuestos', href: '/admin/presupuestos', icon: ShoppingCart },
];

const secondaryItems = [
  { name: 'Más opciones', href: '/admin/configuracion', icon: MoreHorizontal },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const renderItem = (item: (typeof primaryItems)[number]) => {
    const active = pathname === item.href || (item.href !== '/admin/inicio' && pathname?.startsWith(item.href));
    const Icon = item.icon;
    return <Link key={item.name} href={item.href} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition', active ? 'bg-corpicia-green text-white shadow-sm' : 'text-gray-700 hover:bg-green-50 hover:text-corpicia-green')}><Icon className="h-[19px] w-[19px]"/><span>{item.name}</span></Link>;
  };
  return <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
    <div className="border-b p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-corpicia-green text-lg font-black text-white">C</div><div><h2 className="font-bold leading-tight text-gray-950">CORPICIA</h2><p className="text-xs text-gray-500">Administración</p></div></div></div>
    <nav className="flex-1 space-y-2 p-4">{primaryItems.map(renderItem)}</nav>
    <div className="space-y-2 border-t p-4">{secondaryItems.map(item=>renderItem(item as (typeof primaryItems)[number]))}<Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"><Eye className="h-[19px] w-[19px]"/> Ver tienda</Link></div>
  </aside>;
}
