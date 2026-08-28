export const revalidate = 60;

import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { Leaf, Truck, Phone, Shield } from 'lucide-react';
import { getProducts } from '@/lib/repositories/products';
import { getBanners } from '@/lib/repositories/banners';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ProfessionalCta } from '@/components/home/ProfessionalCta';
import { getProfessionalCta } from '@/lib/repositories/professional-cta';
import { getSeoEntry } from '@/lib/repositories/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoEntry('/');

  const defaultMeta = {
    title: 'Corpicia | Paisajismo, Riego Automático y Venta de Césped en Paraguay',
    description: 'Líderes en jardinería, paisajismo y sistemas de riego en Asunción y gran Asunción. Venta de césped natural, insumos para jardines y asesoramiento profesional.',
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
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      title: seoTitle,
      description: seoDescription,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
  };
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

  const featuredProducts = [
    productsCatalog.find((p: any) => p.slug === 'cesped-esmeralda'),
    productsCatalog.find((p: any) => p.slug === 'cesped-siempre-verde'),
    productsCatalog.find((p: any) => p.slug === 'cesped-kavaju'),
    productsCatalog.find((p: any) => p.slug === 'cesped-mani-docena'),
  ].filter(Boolean);

  const underBannerProducts = [
    productsCatalog.find((p: any) => p.slug === 'valvula-riego-rain-bird'),
    productsCatalog.find((p: any) => p.slug === 'aspersor-rain-bird-5004'),
  ].filter(Boolean);

  const mixedProducts = [
    productsCatalog.find((p: any) => p.slug === 'mini-rotor-rain-bird-3500'),
    productsCatalog.find((p: any) => p.slug === 'difusor-riego'),
  ].filter(Boolean);

  const secondaryProducts = [
    productsCatalog.find((p: any) => p.slug === 'piso-ecologico-40x60'),
    productsCatalog.find((p: any) => p.slug === 'separador-cesped-caminos'),
    productsCatalog.find((p: any) => p.slug === 'pisos-imitacion-madera'),
    productsCatalog.find((p: any) => p.slug === 'granza-blanca-fina-decorativa'),
    productsCatalog.find((p: any) => p.slug === 'canto-rodado'),
  ].filter(Boolean);

  const benefits = [
    { icon: Leaf, title: 'Calidad Premium', description: 'Productos duraderos.' },
    { icon: Truck, title: 'Cobertura Nacional', description: 'Envíos en Paraguay.' },
    { icon: Phone, title: 'Asesoría Experta', description: 'Acompañamiento total.' },
    { icon: Shield, title: 'Compra Segura', description: 'Transparencia total.' },
  ];

  return (
    <div className="bg-white">
      <section className="border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <BannerCarousel banners={heroBanners} variant="hero-grid" />
        </div>
      </section>

      <section className="py-6 sm:py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <Card key={b.title} className="min-w-[80%] md:min-w-0">
                  <CardContent className="p-4">
                    <Icon className="text-corpicia-green mb-2 w-5 h-5" />
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="text-sm text-gray-600">{b.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Productos destacados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4">
              <BannerCarousel banners={secondaryBanners} variant="single" />
              <div className="grid grid-cols-2 gap-4">
                {underBannerProducts.map((p) => (
                  <ProductCard key={p!.id} product={p!} />
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Riego Automático</h2>
              {mixedProducts.map((p) => (
                <ProductCard key={p!.id} product={p!} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Paisajismo</h2>

          <div className="grid grid-cols-2 gap-4 md:hidden">
            {secondaryProducts.map((p) => (
              <div className="w-full" key={p!.id}>
                <ProductCard product={p!} />
              </div>
            ))}
          </div>

          <div className="hidden md:block relative">
            <div
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {secondaryProducts.map((p) => (
                <div className="flex-shrink-0 w-[280px]" key={p!.id}>
                  <ProductCard product={p!} />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-2" aria-hidden="true">
              {secondaryProducts.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProfessionalCta settings={professionalCta} />
    </div>
  );
}
