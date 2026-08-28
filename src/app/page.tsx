export const revalidate = 60;

import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { Leaf, Truck, Phone, Shield, CheckCircle2, Camera, ArrowRight } from 'lucide-react';
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

const grassGuide = [
  { name: 'Esmeralda', slug: 'cesped-esmeralda', best: 'Jardines residenciales y terminación premium', sun: 'Sol a media sombra', traffic: 'Medio', care: 'Medio' },
  { name: 'Siempre Verde', slug: 'cesped-siempre-verde', best: 'Uso residencial y espacios verdes', sun: 'Buena exposición solar', traffic: 'Medio', care: 'Medio' },
  { name: 'Kavaju', slug: 'cesped-kavaju', best: 'Superficies amplias y uso exigente', sun: 'Sol', traffic: 'Alto', care: 'Práctico' },
];

export default async function HomePage() {
  const [productsCatalog, bannersResult, professionalCta] = await Promise.all([getProducts(), getBanners(), getProfessionalCta()]);
  const heroBanners = Array.isArray(bannersResult) ? bannersResult.filter((b: any) => b.type === 'hero') : bannersResult.hero;
  const secondaryBanners = Array.isArray(bannersResult) ? bannersResult.filter((b: any) => b.type === 'secondary') : bannersResult.secondary;
  const featuredProducts = ['cesped-esmeralda','cesped-siempre-verde','cesped-kavaju','cesped-mani-docena'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const irrigationProducts = ['valvula-riego-rain-bird','aspersor-rain-bird-5004','mini-rotor-rain-bird-3500','difusor-riego'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const landscapeProducts = ['piso-ecologico-40x60','separador-cesped-caminos','pisos-imitacion-madera','granza-blanca-fina-decorativa','canto-rodado'].map(slug => productsCatalog.find((p:any)=>p.slug===slug)).filter(Boolean);
  const whatsapp = getWhatsAppUrl();

  const benefits = [
    { icon: Leaf, title: '10+ años de experiencia', description: 'Especialistas en espacios verdes desde 2014.' },
    { icon: Truck, title: 'Cobertura en Paraguay', description: 'Atendemos proyectos residenciales y comerciales.' },
    { icon: Phone, title: 'Asesoría especializada', description: 'Te ayudamos a elegir la solución adecuada.' },
    { icon: Shield, title: 'Solución integral', description: 'Césped, instalación, riego y mantenimiento.' },
  ];

  return <div className="bg-white">
    <section className="border-b bg-gradient-to-b from-green-50/60 to-white">
      <div className="container mx-auto px-4 pt-8 md:pt-12">
        <div className="max-w-4xl mx-auto text-center mb-7">
          <p className="text-corpicia-green font-semibold mb-2">Especialistas en espacios verdes en Paraguay</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 leading-tight">Césped natural, paisajismo y riego automático en Paraguay</h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">Venta e instalación profesional para hogares, empresas y proyectos, con asesoramiento especializado desde la elección del césped hasta el mantenimiento.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-corpicia-green px-6 py-3 font-semibold text-white hover:opacity-90">Cotizar mi proyecto</a>
            <Link href="/productos" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50">Ver césped y precios</Link>
          </div>
        </div>
        <div className="pb-6"><BannerCarousel banners={heroBanners} variant="hero-grid" /></div>
      </div>
    </section>

    <section className="py-7 bg-gray-50 border-b"><div className="container mx-auto px-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{benefits.map(b=>{const Icon=b.icon;return <Card key={b.title}><CardContent className="p-4 sm:p-5"><Icon className="text-corpicia-green mb-2 w-5 h-5"/><h2 className="font-bold text-sm sm:text-base">{b.title}</h2><p className="text-xs sm:text-sm text-gray-600 mt-1">{b.description}</p></CardContent></Card>})}</div></div></section>

    <section className="py-12 md:py-16"><div className="container mx-auto px-4"><div className="max-w-3xl mb-8"><p className="text-sm font-bold uppercase tracking-wider text-corpicia-green">De principio a fin</p><h2 className="text-2xl md:text-3xl font-bold mt-2">No solo vendemos césped: resolvemos tu espacio verde</h2><p className="text-gray-600 mt-3">Te acompañamos para que el proyecto quede bien desde la preparación del terreno hasta el cuidado posterior.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[['01','Evaluamos','Revisamos el terreno y tus necesidades.'],['02','Preparamos','Acondicionamos la superficie para una instalación correcta.'],['03','Instalamos','Suministramos césped y ejecutamos la instalación profesional.'],['04','Acompañamos','Te orientamos sobre riego, mantenimiento y cuidado.']].map(([n,t,d])=><div key={n} className="rounded-2xl border p-5"><span className="text-corpicia-green font-bold">{n}</span><h3 className="font-bold text-lg mt-3">{t}</h3><p className="text-sm text-gray-600 mt-2">{d}</p></div>)}</div></div></section>

    <section className="py-12 md:py-16 bg-green-50/60"><div className="container mx-auto px-4"><div className="text-center max-w-3xl mx-auto mb-8"><p className="text-sm font-bold uppercase tracking-wider text-corpicia-green">Elegí mejor</p><h2 className="text-2xl md:text-3xl font-bold mt-2">¿Qué césped es mejor para tu terreno?</h2><p className="text-gray-600 mt-3">Compará las principales variedades. Si todavía tenés dudas, mandanos una foto del terreno y te orientamos.</p></div><div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[720px] text-sm"><thead className="bg-gray-50"><tr><th className="p-4 text-left">Variedad</th><th className="p-4 text-left">Ideal para</th><th className="p-4 text-left">Sol</th><th className="p-4 text-left">Tráfico</th><th className="p-4 text-left">Mantenimiento</th><th className="p-4"></th></tr></thead><tbody>{grassGuide.map(g=><tr key={g.slug} className="border-t"><td className="p-4 font-bold">{g.name}</td><td className="p-4 text-gray-600">{g.best}</td><td className="p-4">{g.sun}</td><td className="p-4">{g.traffic}</td><td className="p-4">{g.care}</td><td className="p-4"><Link className="text-corpicia-green font-semibold" href={`/productos/${g.slug}`}>Ver producto</Link></td></tr>)}</tbody></table></div><div className="text-center mt-6"><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 justify-center rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white"><Camera className="w-5 h-5"/>No sé cuál elegir: enviar foto por WhatsApp</a></div></div></section>

    <section className="py-12"><div className="container mx-auto px-4"><div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-sm font-bold uppercase tracking-wider text-corpicia-green">Césped natural</p><h2 className="text-2xl md:text-3xl font-bold mt-1">Productos destacados</h2></div><Link href="/productos" className="hidden sm:inline-flex items-center gap-1 font-semibold text-corpicia-green">Ver catálogo <ArrowRight className="w-4 h-4"/></Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{featuredProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <section className="pb-12"><div className="container mx-auto px-4"><BannerCarousel banners={secondaryBanners} variant="single" /></div></section>

    <section className="py-12 bg-gray-50"><div className="container mx-auto px-4"><div className="max-w-3xl mb-7"><p className="text-sm font-bold uppercase tracking-wider text-corpicia-green">Servicios</p><h2 className="text-2xl md:text-3xl font-bold mt-2">Todo lo que tu espacio verde necesita</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[
      ['Instalación de césped','Preparación y colocación profesional de césped natural.','/servicios/instalacion-de-cesped'],
      ['Riego automático','Soluciones de riego eficientes para jardines y proyectos.','/servicios/riego-automatico'],
      ['Paisajismo','Diseño y ejecución de espacios verdes funcionales.','/servicios/paisajismo'],
      ['Mantenimiento de jardines','Cuidado periódico para conservar el jardín en buenas condiciones.','/servicios/mantenimiento-de-jardines'],
    ].map(([t,d,href])=><Link href={href} key={t} className="rounded-2xl bg-white border p-5 hover:shadow-md transition-shadow"><CheckCircle2 className="w-5 h-5 text-corpicia-green"/><h3 className="font-bold text-lg mt-3">{t}</h3><p className="text-sm text-gray-600 mt-2">{d}</p><span className="inline-flex mt-4 text-sm font-semibold text-corpicia-green">Conocer servicio →</span></Link>)}</div></div></section>

    <section className="py-12"><div className="container mx-auto px-4"><h2 className="text-2xl md:text-3xl font-bold mb-6">Riego automático</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{irrigationProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <section className="pb-14"><div className="container mx-auto px-4"><h2 className="text-2xl md:text-3xl font-bold mb-6">Paisajismo y terminaciones</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{landscapeProducts.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div></div></section>

    <ProfessionalCta settings={professionalCta}/>
  </div>;
}
