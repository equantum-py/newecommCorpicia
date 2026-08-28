'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Eye,
  FileText,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Package,
  Plus,
  Settings2,
  ShoppingCart,
  Sprout,
  Users,
  Wrench,
} from 'lucide-react';

const stats = [
  { label: 'Productos', value: 'Catálogo', note: 'Gestionar productos activos', icon: Package, href: '/admin/productos' },
  { label: 'Promociones', value: 'Banners', note: 'Ofertas y campañas vigentes', icon: Megaphone, href: '/admin/banners' },
  { label: 'Presupuestos', value: 'Solicitudes', note: 'Revisar oportunidades comerciales', icon: FileText, href: '/admin/presupuestos' },
  { label: 'Clientes', value: 'Base comercial', note: 'Consultar clientes registrados', icon: Users, href: '/admin/clientes' },
];

const homeSections = [
  { title: 'Hero principal', description: 'Título, propuesta de valor, botones y presentación principal.', icon: Home },
  { title: 'Métricas de confianza', description: 'Años de experiencia, clientes, m² instalados y proyectos.', icon: LayoutDashboard },
  { title: 'Productos destacados · Césped', description: 'Selección de variedades visibles en la página principal.', icon: Sprout },
  { title: 'Promociones vigentes', description: 'Banners y ofertas comerciales activas.', icon: Megaphone, href: '/admin/banners' },
  { title: 'Bloque de Riego Automático', description: 'Contenido comercial y productos destacados de riego.', icon: Wrench },
  { title: 'Servicios destacados', description: 'Instalación, riego, paisajismo y mantenimiento.', icon: Settings2, href: '/admin/servicios' },
  { title: 'Paisajismo y materiales', description: 'Productos y terminaciones seleccionados para Home.', icon: ImageIcon },
  { title: 'CTA Profesionales', description: 'Bloque de captación para jardineros y profesionales.', icon: Users, href: '/admin/cta-profesionales' },
];

const quickActions = [
  { label: 'Nuevo producto', href: '/admin/productos/nuevo', icon: Package },
  { label: 'Nueva promoción', href: '/admin/banners', icon: Megaphone },
  { label: 'Editar Home', href: '#contenido-home', icon: Home },
  { label: 'Ver presupuestos', href: '/admin/presupuestos', icon: ShoppingCart },
  { label: 'Ver clientes', href: '/admin/clientes', icon: Users },
  { label: 'Ver sitio web', href: '/', icon: Eye, external: true },
];

export default function AdminInicioPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
      <section className="rounded-2xl bg-gradient-to-r from-[#07522f] to-[#0b6a3c] p-5 text-white shadow-sm md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-green-100">Panel administrativo Corpicia</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Bienvenido, Administrador</h1>
            <p className="mt-2 max-w-2xl text-sm text-green-50/90">Gestioná el catálogo, la página principal y las oportunidades comerciales desde un solo lugar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20">
              <Eye className="h-4 w-4" /> Ver sitio web
            </Link>
            <Link href="/#inicio" target="_blank" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#07522f] hover:bg-green-50">
              Vista previa <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-950">{stat.value}</p>
                </div>
                <span className="rounded-xl bg-green-50 p-2.5 text-corpicia-green"><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 text-xs text-gray-500 group-hover:text-corpicia-green">{stat.note} →</p>
            </Link>
          );
        })}
      </section>

      <section id="contenido-home" className="grid gap-6 xl:grid-cols-[1.55fr_.85fr] scroll-mt-24">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-corpicia-green">Contenido web</p>
              <h2 className="mt-1 text-xl font-bold text-gray-950">Contenido de la Home</h2>
              <p className="mt-1 text-sm text-gray-500">Administrá las secciones que forman la página principal aprobada.</p>
            </div>
            <Link href="/" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-lg bg-corpicia-green px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              <Eye className="h-4 w-4" /> Ver Home
            </Link>
          </div>

          <div className="divide-y">
            {homeSections.map((section) => {
              const Icon = section.icon;
              const content = (
                <div className="flex items-center gap-3 p-4 transition hover:bg-gray-50 sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-corpicia-green"><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-950">{section.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{section.description}</p>
                  </div>
                  <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 sm:inline-flex">Visible</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
              );
              return section.href ? <Link key={section.title} href={section.href}>{content}</Link> : <div key={section.title}>{content}</div>;
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-corpicia-green">Gestión comercial</p>
                <h2 className="mt-1 text-lg font-bold">Accesos importantes</h2>
              </div>
              <Activity className="h-5 w-5 text-corpicia-green" />
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/admin/presupuestos" className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium hover:bg-gray-50"><span>Presupuestos recibidos</span><ArrowRight className="h-4 w-4" /></Link>
              <Link href="/admin/dashboard-comercial" className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium hover:bg-gray-50"><span>Dashboard comercial</span><ArrowRight className="h-4 w-4" /></Link>
              <Link href="/admin/actividad" className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium hover:bg-gray-50"><span>Actividad reciente</span><ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-[#f4fbf6] p-5 shadow-sm">
            <Megaphone className="h-6 w-6 text-corpicia-green" />
            <h2 className="mt-3 text-lg font-bold text-gray-950">Promociones</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Administrá los banners y ofertas que aparecen en la nueva Home.</p>
            <Link href="/admin/banners" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-corpicia-green px-4 py-2.5 text-sm font-semibold text-white">
              Gestionar promociones <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-corpicia-green">Atajos</p>
          <h2 className="mt-1 text-xl font-bold text-gray-950">Acciones rápidas</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} target={action.external ? '_blank' : undefined} className="group flex min-h-28 flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-green-200 hover:bg-green-50/50">
                <span className="rounded-xl bg-green-50 p-2.5 text-corpicia-green"><Icon className="h-5 w-5" /></span>
                <span className="mt-3 text-sm font-semibold text-gray-800 group-hover:text-corpicia-green">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
