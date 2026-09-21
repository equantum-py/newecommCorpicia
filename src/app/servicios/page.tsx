import { ArrowRight, Leaf, Scissors, ShieldCheck, Sprout, Droplets, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getWhatsAppUrl } from '@/lib/utils';
import { getServices } from '@/lib/repositories/services';
import { getSeoEntry } from '@/lib/repositories/seo';
import { ServiceCTAButton } from '@/components/services/ServiceCTAButton';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoEntry('/servicios');
  const defaultMeta = {
    title: 'Servicios de Césped, Riego y Paisajismo en Paraguay | Corpicia',
    description: 'Instalación de césped natural, riego automático, paisajismo, mantenimiento de jardines y poda de árboles en Paraguay. Solicitá asesoramiento y presupuesto.',
    alternates: { canonical: '/servicios/' },
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

const dedicatedServices = [
  {
    title: 'Instalación de césped natural',
    description: 'Preparamos el terreno e instalamos el césped para que arranque parejo y en buenas condiciones.',
    href: '/servicios/instalacion-de-cesped',
    icon: Sprout,
  },
  {
    title: 'Riego automático',
    description: 'Diseñamos e instalamos sistemas de riego prácticos para mantener tus áreas verdes.',
    href: '/servicios/riego-automatico',
    icon: Droplets,
  },
  {
    title: 'Paisajismo',
    description: 'Diseñamos espacios verdes funcionales, agradables y pensados para el uso diario.',
    href: '/servicios/paisajismo',
    icon: Leaf,
  },
  {
    title: 'Mantenimiento de jardines',
    description: 'Cuidado periódico para mantener el jardín limpio, sano y prolijo durante todo el año.',
    href: '/servicios/mantenimiento-de-jardines',
    icon: ShieldCheck,
  },
];

export default async function ServicesPage() {
  const services = await getServices();
  const whatsappUrl = getWhatsAppUrl();
  const podaService = services.find((service: any) =>
    String(service.slug || service.title || '').toLowerCase().includes('poda')
  );
  const otherServices = services.filter((service: any) => service !== podaService);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-[#f4f7f1]">
        <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-16 lg:py-20">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-corpicia-green">Servicios Corpicia</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] text-gray-950 md:text-5xl lg:text-6xl">
              Tu espacio verde, bien hecho desde el comienzo.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
              Césped natural, riego, paisajismo, mantenimiento y poda para hogares, empresas y proyectos.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ServiceCTAButton serviceId="services-hero" serviceTitle="Consulta por servicios" whatsappUrl={whatsappUrl} buttonLocation="services_hero">
                <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-corpicia-green px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Pedir presupuesto <ArrowRight className="h-4 w-4" />
                </span>
              </ServiceCTAButton>
              <a href="#servicios" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400">
                Ver servicios
              </a>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-gray-200 md:min-h-[430px]">
            <Image src="/trabajos/trabajo-2.jpg" alt="Trabajo de jardinería realizado por Corpicia" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-sm backdrop-blur sm:right-auto sm:max-w-xs">
              <p className="font-semibold text-gray-950">¿No sabés qué trabajo necesita tu jardín?</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">Mandanos una foto por WhatsApp y te orientamos.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="container mx-auto px-4 py-14 md:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-corpicia-green">Nuestros servicios</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-950 md:text-4xl">Todo lo que tu espacio verde necesita</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {dedicatedServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link href={service.href} key={service.href} className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-corpicia-green/10">
                  <Icon className="h-6 w-6 text-corpicia-green" />
                </div>
                <h3 className="text-xl font-bold text-gray-950">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-corpicia-green">
                  Ver servicio <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {podaService && (
        <section className="bg-[#173f27] text-white">
          <div className="container mx-auto grid gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:py-16">
            <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-[#245437] md:min-h-[460px]">
              {podaService.image_url ? (
                <Image src={podaService.image_url} alt={podaService.title || 'Poda de árboles'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center">
                  <Scissors className="h-20 w-20 text-white/35" />
                </div>
              )}
            </div>
            <div className="md:px-6 lg:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/65">Servicio destacado</p>
              <h2 className="mt-2 text-4xl font-bold">Poda de árboles</h2>
              <p className="mt-4 text-lg leading-8 text-white/80">
                ¿Tenés ramas sobre el techo, demasiada sombra o un árbol que necesita mantenimiento? Revisamos el caso y te orientamos sobre el trabajo más conveniente.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-white/90 sm:grid-cols-2">
                <span>• Ramas secas o peligrosas</span>
                <span>• Árboles cerca de la vivienda</span>
                <span>• Exceso de sombra</span>
                <span>• Poda preventiva</span>
              </div>
              <div className="mt-8">
                <ServiceCTAButton serviceId={podaService.id || podaService.slug || 'poda-de-arboles'} serviceTitle="Poda de Árboles" whatsappUrl={whatsappUrl} buttonLocation="poda_featured">
                  <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#173f27] transition hover:bg-gray-100">
                    <MessageCircle className="h-4 w-4" /> Enviar foto y consultar
                  </span>
                </ServiceCTAButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {otherServices.length > 0 && (
        <section className="container mx-auto px-4 py-14">
          <div className="grid gap-5 md:grid-cols-2">
            {otherServices.map((service: any) => (
              <div key={service.title || service.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-xl font-bold text-gray-950">{service.title}</h3>
                <p className="mt-2 leading-7 text-gray-600">{service.description}</p>
                <div className="mt-5">
                  <ServiceCTAButton serviceId={service.id || service.slug || service.title} serviceTitle={service.title} whatsappUrl={whatsappUrl} buttonLocation="service_card" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-16 pt-4">
        <div className="rounded-3xl bg-[#f3f6f1] px-6 py-10 text-center md:px-10 md:py-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-gray-950 md:text-4xl">¿Tenés un trabajo para hacer?</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">Contanos qué necesitás. Podés enviarnos fotos y medidas para orientarte mejor desde el inicio.</p>
          <div className="mt-7 flex justify-center">
            <ServiceCTAButton serviceId="general-services-cta" serviceTitle="Consultas Generales de Servicios" whatsappUrl={whatsappUrl} buttonLocation="service_cta">
              <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-corpicia-green px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Consultar por WhatsApp <ArrowRight className="h-4 w-4" />
              </span>
            </ServiceCTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}
