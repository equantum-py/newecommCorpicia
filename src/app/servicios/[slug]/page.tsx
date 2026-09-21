import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getWhatsAppUrl } from '@/lib/utils';

type ServiceContent = {
  title: string;
  eyebrow: string;
  description: string;
  benefits: string[];
  intro: string;
};

const servicePages: Record<string, ServiceContent> = {
  'instalacion-de-cesped': {
    title: 'Instalación de césped natural',
    eyebrow: 'Césped natural',
    description: 'Preparación del terreno y colocación profesional de césped para hogares, empresas y proyectos.',
    intro: 'Evaluamos el espacio, preparamos el terreno y realizamos la colocación para lograr una terminación pareja y lista para cuidar.',
    benefits: ['Evaluación del terreno', 'Preparación y nivelación', 'Colocación profesional', 'Orientación para el cuidado inicial'],
  },
  'riego-automatico': {
    title: 'Riego automático',
    eyebrow: 'Sistemas de riego',
    description: 'Diseño e instalación de sistemas de riego para mantener tus áreas verdes con una distribución eficiente del agua.',
    intro: 'Revisamos el área y planteamos una solución de riego acorde al jardín, césped o proyecto que necesitás mantener.',
    benefits: ['Diseño según el espacio', 'Instalación profesional', 'Aspersores y componentes', 'Configuración y orientación de uso'],
  },
  paisajismo: {
    title: 'Paisajismo',
    eyebrow: 'Diseño de espacios verdes',
    description: 'Diseño y ejecución de espacios verdes funcionales, agradables y adaptados a cada proyecto.',
    intro: 'Combinamos césped, plantas, terminaciones y distribución del espacio para crear un entorno práctico y visualmente ordenado.',
    benefits: ['Evaluación del espacio', 'Propuesta de distribución', 'Selección de materiales y vegetación', 'Ejecución del proyecto'],
  },
  'mantenimiento-de-jardines': {
    title: 'Mantenimiento de jardines',
    eyebrow: 'Cuidado de áreas verdes',
    description: 'Mantenimiento periódico para conservar el césped, las plantas y el jardín en buenas condiciones.',
    intro: 'Organizamos el mantenimiento según las necesidades del espacio para conservarlo limpio, prolijo y saludable durante el año.',
    benefits: ['Corte y mantenimiento', 'Limpieza del área', 'Cuidado de plantas y césped', 'Seguimiento periódico'],
  },
};

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = servicePages[slug];
  if (!service) return {};
  return {
    title: `${service.title} en Paraguay | Corpicia`,
    description: service.description,
    alternates: { canonical: `/servicios/${slug}/` },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = servicePages[slug];
  if (!service) notFound();

  const whatsappUrl = getWhatsAppUrl();
  const message = encodeURIComponent(`Hola Corpicia, quiero consultar por el servicio de ${service.title}.`);
  const separator = whatsappUrl.includes('?') ? '&' : '?';
  const serviceWhatsAppUrl = `${whatsappUrl}${separator}text=${message}`;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-[#f4f7f1]">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Link href="/servicios" className="inline-flex items-center gap-2 text-sm font-semibold text-corpicia-green">
            <ArrowLeft className="h-4 w-4" /> Volver a servicios
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-corpicia-green">{service.eyebrow}</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-bold leading-tight text-gray-950 md:text-5xl">{service.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">{service.description}</p>
          <div className="mt-7">
            <a href={serviceWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[1.05fr_.95fr] md:items-start md:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-corpicia-green">Cómo trabajamos</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-950">Una solución pensada para tu espacio</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">{service.intro}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">Incluye</h2>
          <ul className="mt-5 space-y-4">
            {service.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-gray-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-corpicia-green" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-[#173f27] px-6 py-10 text-white md:px-10 md:py-12">
          <h2 className="text-3xl font-bold">¿Querés cotizar este servicio?</h2>
          <p className="mt-3 max-w-2xl text-white/80">Contanos qué necesitás y, si podés, envianos fotos o medidas del lugar para orientarte mejor.</p>
          <a href={serviceWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#173f27]">
            Pedir presupuesto <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
