'use client';

import Link from 'next/link';
import { ArrowRight, Eye, FileText, Home, Images, Megaphone, Package, Wrench } from 'lucide-react';

const mainActions = [
  { title: 'Editar Home', note: 'Textos y contenido principal', href: '/admin/inicio#editar-home', icon: Home },
  { title: 'Productos', note: 'Precios, fotos y disponibilidad', href: '/admin/productos', icon: Package },
  { title: 'Promociones', note: 'Banners y ofertas', href: '/admin/banners', icon: Megaphone },
  { title: 'Servicios', note: 'Césped, riego y paisajismo', href: '/admin/servicios', icon: Wrench },
  { title: 'Galería', note: 'Trabajos realizados', href: '/admin/galeria', icon: Images },
  { title: 'Presupuestos', note: 'Ver solicitudes recibidas', href: '/admin/presupuestos', icon: FileText },
];
const homeActions = [
  { title: 'Portada', note: 'Título y botones principales', href: '/admin/configuracion' },
  { title: 'Césped destacado', note: 'Elegir productos visibles', href: '/admin/productos' },
  { title: 'Promociones', note: 'Cambiar banners de la Home', href: '/admin/banners' },
  { title: 'Riego automático', note: 'Productos y contenido de riego', href: '/admin/productos' },
  { title: 'Servicios', note: 'Editar servicios destacados', href: '/admin/servicios' },
  { title: 'Galería de trabajos', note: 'Fotos de proyectos realizados', href: '/admin/galeria' },
  { title: 'Profesionales', note: 'Editar llamado para profesionales', href: '/admin/cta-profesionales' },
];

export default function AdminInicioPage() { return <div className="mx-auto max-w-[1280px] space-y-7 pb-12">
  <section className="flex flex-col gap-4 rounded-2xl bg-[#075c34] p-6 text-white md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-green-100">¿Qué querés hacer?</p><h1 className="mt-1 text-2xl font-bold md:text-3xl">Administrar Corpicia</h1></div><Link href="/" target="_blank" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#075c34]"><Eye className="h-4 w-4"/> Ver tienda</Link></section>
  <section><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{mainActions.map(action=>{const Icon=action.icon;return <Link key={action.title} href={action.href} className="group flex min-h-[150px] flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-corpicia-green"><Icon className="h-5 w-5"/></span><div className="mt-5"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold text-gray-950">{action.title}</h2><ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-corpicia-green"/></div><p className="mt-1 text-xs text-gray-500">{action.note}</p></div></Link>})}</div></section>
  <section id="editar-home" className="scroll-mt-24 rounded-2xl border bg-white shadow-sm"><div className="flex items-center justify-between gap-4 border-b p-5"><div><h2 className="text-xl font-bold text-gray-950">Editar Home</h2><p className="mt-1 text-sm text-gray-500">Elegí qué parte querés cambiar.</p></div><Link href="/" target="_blank" className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"><Eye className="h-4 w-4"/> Ver Home</Link></div><div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{homeActions.map((item,index)=><Link key={item.title} href={item.href} className="group flex items-center gap-4 rounded-xl border p-4 transition hover:border-green-300 hover:bg-green-50/40"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-corpicia-green text-sm font-bold text-white">{index+1}</span><div className="min-w-0 flex-1"><p className="font-bold text-gray-950">{item.title}</p><p className="mt-0.5 text-xs text-gray-500">{item.note}</p></div><ArrowRight className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-corpicia-green"/></Link>)}</div></section>
  <section className="rounded-2xl bg-green-50 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-gray-950">¿Querés cargar algo nuevo?</p><p className="mt-1 text-sm text-gray-600">Creá un producto, cargá un trabajo realizado o revisá solicitudes.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/productos/nuevo" className="rounded-lg bg-corpicia-green px-4 py-2.5 text-sm font-bold text-white">+ Nuevo producto</Link><Link href="/admin/galeria" className="rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-bold text-corpicia-green">+ Nuevo trabajo</Link><Link href="/admin/presupuestos" className="rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-bold text-corpicia-green">Ver presupuestos</Link></div></div></section>
</div>; }
