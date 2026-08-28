export const revalidate = 60;

import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Award, Users, Sprout, Briefcase, CheckCircle2, ArrowRight, MessageCircle, Droplets, Leaf, Wrench } from 'lucide-react';
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

function bannerImage(banner: any) {
  return banner?.image_desktop || banner?.imageDesktop || banner?.image_mobile || banner?.imageMobile || '';
}

export default async function HomePage() {
  const [productsCatalog, bannersResult, professionalCta] = await Promise.all([
    getProducts(),
    getBanners(),
    getProfessionalCta(),
  ]);

  const heroBanners = Array.isArray(bannersResult)
    ? bannersResult.filter((b: any) => b.type === 'hero')
    : bannersResult.hero;
  const secondaryBanners = Array.isArray(bannersResult)
    ? bannersResult.filter((b: any) => b.type === 'secondary')
    : bannersResult.secondary;

  const featuredSlugs = ['cesped-esmeralda', 'cesped-siempre-verde', 'cesped-kavaju', 'cesped-mani-docena'];
  const featuredProducts = featuredSlugs.map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const irrigationProducts = ['valvula-riego-rain-bird','aspersor-rain-bird-5004','mini-rotor-rain-bird-3500','difusor-riego'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const landscapeProducts = ['piso-ecologico-40x60','separador-cesped-caminos','pisos-imitacion-madera','granza-blanca-fina-decorativa','canto-rodado'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);

  const whatsapp = getWhatsAppUrl();
  const heroImage = bannerImage(heroBanners?.[0]);

  const stats = [
    { icon: Award, value: '+10 años', label: 'de experiencia' },
    { icon: Users, value: '+1.000', label: 'clientes satisfechos' },
    { icon: Sprout, value: '+50.000 m²', label: 'instalados' },
    { icon: Briefcase, value: '+50', label: 'proyectos corporativos' },
  ];

  const services = [
    { icon: Sprout, title: 'Instalación de césped', text: 'Preparación y colocación profesional de césped natural.', href: '/servicios/instalacion-de-cesped' },
    { icon: Droplets, title: 'Riego automático', text: 'Diseño e instalación de sistemas de riego para jardines y proyectos.', href: '/servicios/riego-automatico' },
    { icon: Leaf, title: 'Paisajismo', text: 'Diseño y ejecución de espacios verdes funcionales y estéticos.', href: '/servicios/paisajismo' },
    { icon: Wrench, title: 'Mantenimiento', text: 'Cuidado periódico para conservar tu espacio verde.', href: '/servicios/mantenimiento-de-jardines' },
  ];

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#0b3d20] text-white">
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(4,35,17,.88) 0%, rgba(4,35,17,.62) 42%, rgba(4,35,17,.12) 100%), url(${heroImage})` }}
          />
        )}
        <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold text-green-200">Especialistas en espacios verdes en Paraguay</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.03]">
              Césped natural, paisajismo y riego automático
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/90 leading-relaxed">
              Venta, instalación y asesoramiento profesional para hogares, empresas y proyectos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg hover:brightness-95">
                <MessageCircle className="h-5 w-5" /> Cotizar proyecto
              </a>
              <Link href="/productos" className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100">
                Ver productos
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
              {['Asesoría personalizada','Instalación profesional','Cobertura en Paraguay'].map(item => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-300" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-5 md:-mt-7">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl border bg-white shadow-xl">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.value} className={`flex items-center gap-3 px-4 py-5 md:px-6 ${index > 0 ? 'border-l' : ''} ${index > 1 ? 'border-t lg:border-t-0' : ''}`}>
                  <Icon className="h-8 w-8 shrink-0 text-corpicia-green" />
                  <div><p className="text-lg md:text-xl font-bold text-gray-950">{stat.value}</p><p className="text-xs md:text-sm text-gray-500">{stat.label}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Césped natural</p><h2 className="mt-1 text-2xl md:text-3xl font-bold">Elegí la variedad para tu proyecto</h2></div>
            <Link href="/productos" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-corpicia-green">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_230px]">
            {featuredProducts.map((p:any)=><ProductCard key={p.id} product={p} />)}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 flex min-h-[260px] flex-col justify-between rounded-2xl border border-green-100 bg-green-50 p-5">
              <div><p className="text-xl font-bold text-gray-950">¿No sabés qué césped elegir?</p><p className="mt-2 text-sm leading-relaxed text-gray-600">Mandanos una foto del terreno por WhatsApp y te orientamos según tu espacio.</p></div>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4"/>Consultar ahora</a>
            </div>
          </div>
        </div>
      </section>

      {heroBanners?.length > 0 && (
        <section className="border-y bg-gray-50 py-9">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Promociones vigentes</p><h2 className="text-xl md:text-2xl font-bold">Ofertas y soluciones destacadas</h2></div></div>
            <BannerCarousel banners={heroBanners} variant="hero-grid" />
          </div>
        </section>
      )}

      {secondaryBanners?.length > 0 && (
        <section className="py-10">
          <div className="container mx-auto px-4"><BannerCarousel banners={secondaryBanners} variant="single" /></div>
        </section>
      )}

      <section className="bg-[#072f19] py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div><p className="text-sm font-semibold text-green-300">Riego automático</p><h2 className="mt-2 text-3xl md:text-4xl font-bold">Cuidá mejor tus áreas verdes</h2><p className="mt-3 max-w-xl text-white/75">Sistemas eficientes para jardines y proyectos, con asesoramiento e instalación profesional.</p><Link href="/servicios/riego-automatico" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white px-5 py-2.5 font-semibold text-gray-900">Ver sistemas de riego</Link></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{irrigationProducts.map((p:any)=><div key={p.id} className="rounded-xl bg-white text-gray-900 overflow-hidden"><ProductCard product={p}/></div>)}</div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Servicios</p><h2 className="mt-1 text-2xl md:text-3xl font-bold">Soluciones para tu espacio verde</h2></div><Link href="/servicios" className="hidden sm:inline-flex text-sm font-semibold text-corpicia-green">Ver todos los servicios →</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map(service=>{const Icon=service.icon;return <Link key={service.href} href={service.href} className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50"><Icon className="h-5 w-5 text-corpicia-green"/></div><h3 className="mt-4 text-lg font-bold">{service.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">{service.text}</p><span className="mt-4 inline-flex text-sm font-semibold text-corpicia-green">Ver servicio →</span></Link>})}</div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Paisajismo</p><h2 className="mt-1 text-2xl md:text-3xl font-bold">Terminaciones y materiales</h2></div><Link href="/servicios/paisajismo" className="text-sm font-semibold text-corpicia-green">Ver servicio →</Link></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{landscapeProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>
        </div>
      </section>

      <ProfessionalCta settings={professionalCta} />
    </div>
  );
}
