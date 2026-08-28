export const revalidate = 60;

import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { Leaf, Truck, Phone, Shield, ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/repositories/products';
import { getBanners } from '@/lib/repositories/banners';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ProfessionalCta } from '@/components/home/ProfessionalCta';
import { getProfessionalCta } from '@/lib/repositories/professional-cta';
import { getSeoEntry } from '@/lib/repositories/seo';
import { getWhatsAppUrl } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoEntry('/');
  const defaultMeta = {
    title: 'Césped Natural, Paisajismo y Riego Automático en Paraguay | Corpicia',
    description: 'Venta e instalación de césped natural, paisajismo, riego automático y mantenimiento de jardines en Paraguay. Cotizá tu proyecto con Corpicia.',
    alternates: { canonical: '/' },
  };
  if (!seo) return defaultMeta;
  const seoTitle = seo.title || defaultMeta.title;
  const seoDescription = seo.description || defaultMeta.description;
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seo.keywords ? seo.keywords.split(',').map((k: string) => k.trim()) : undefined,
    alternates: defaultMeta.alternates,
    openGraph: { title: seoTitle, description: seoDescription, images: seo.og_image ? [{ url: seo.og_image }] : undefined },
    twitter: { title: seoTitle, description: seoDescription, images: seo.og_image ? [seo.og_image] : undefined },
  };
}

export default async function HomePage() {
  const [productsCatalog, bannersResult, professionalCta] = await Promise.all([getProducts(), getBanners(), getProfessionalCta()]);
  const heroBanners = Array.isArray(bannersResult) ? bannersResult.filter((b: any) => b.type === 'hero') : bannersResult.hero;
  const secondaryBanners = Array.isArray(bannersResult) ? bannersResult.filter((b: any) => b.type === 'secondary') : bannersResult.secondary;
  const featuredProducts = ['cesped-esmeralda','cesped-siempre-verde','cesped-kavaju','cesped-mani-docena'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const irrigationProducts = ['valvula-riego-rain-bird','aspersor-rain-bird-5004','mini-rotor-rain-bird-3500','difusor-riego'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const landscapeProducts = ['piso-ecologico-40x60','separador-cesped-caminos','pisos-imitacion-madera','granza-blanca-fina-decorativa','canto-rodado'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const whatsapp = getWhatsAppUrl();

  const benefits = [
    { icon: Leaf, title: '10+ años de experiencia', description: 'Especialistas en espacios verdes.' },
    { icon: Truck, title: 'Cobertura en Paraguay', description: 'Proyectos residenciales y comerciales.' },
    { icon: Phone, title: 'Asesoría especializada', description: 'Te ayudamos a elegir mejor.' },
    { icon: Shield, title: 'Solución integral', description: 'Césped, riego y paisajismo.' },
  ];

  return <div className="bg-white">
    <section className="border-b bg-gradient-to-b from-green-50/50 to-white">
      <div className="container mx-auto px-4 pt-5 md:pt-7">
        <div className="max-w-5xl mx-auto text-center mb-5">
          <p className="text-xs sm:text-sm text-corpicia-green font-semibold mb-1.5">Especialistas en espacios verdes en Paraguay</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-950 leading-tight">Césped natural, paisajismo y riego automático</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Venta, instalación y asesoramiento profesional para hogares, empresas y proyectos.</p>
          <div className="mt-4 flex flex-row flex-wrap justify-center gap-2">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-corpicia-green px-5 py-2 text-sm font-semibold text-white hover:opacity-90">Cotizar proyecto</a>
            <Link href="/productos" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">Ver productos</Link>
          </div>
        </div>
        <div className="pb-5"><BannerCarousel banners={heroBanners} variant="hero-grid" /></div>
      </div>
    </section>

    <section className="py-5 bg-gray-50 border-b"><div className="container mx-auto px-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">{benefits.map(b=>{const Icon=b.icon;return <Card key={b.title}><CardContent className="p-3.5 sm:p-4"><div className="flex items-start gap-2.5"><Icon className="text-corpicia-green mt-0.5 w-4 h-4 shrink-0"/><div><h2 className="font-bold text-xs sm:text-sm">{b.title}</h2><p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">{b.description}</p></div></div></CardContent></Card>})}</div></div></section>

    <section className="py-9 md:py-11"><div className="container mx-auto px-4"><div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-xs font-bold uppercase tracking-wider text-corpicia-green">Césped natural</p><h2 className="text-xl md:text-2xl font-bold mt-1">Productos destacados</h2></div><Link href="/productos" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-corpicia-green">Ver catálogo <ArrowRight className="w-4 h-4"/></Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{featuredProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <section className="pb-10"><div className="container mx-auto px-4"><BannerCarousel banners={secondaryBanners} variant="single" /></div></section>

    <section className="py-9 bg-gray-50"><div className="container mx-auto px-4"><div className="flex items-center justify-between mb-5"><h2 className="text-xl md:text-2xl font-bold">Riego automático</h2><Link href="/servicios/riego-automatico" className="text-sm font-semibold text-corpicia-green">Ver servicio →</Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{irrigationProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <section className="py-9 md:py-11"><div className="container mx-auto px-4"><div className="flex items-center justify-between mb-5"><h2 className="text-xl md:text-2xl font-bold">Paisajismo y terminaciones</h2><Link href="/servicios/paisajismo" className="text-sm font-semibold text-corpicia-green">Ver servicio →</Link></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{landscapeProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <ProfessionalCta settings={professionalCta}/>
  </div>;
}
