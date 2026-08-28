import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/utils';
import { getServices } from '@/lib/repositories/services';
import Image from 'next/image';
import { getSeoEntry } from '@/lib/repositories/seo';
import { ServiceCTAButton } from '@/components/services/ServiceCTAButton';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoEntry('/servicios');
  const defaultMeta = { title: 'Servicios de Césped, Riego y Paisajismo en Paraguay | Corpicia', description: 'Instalación de césped natural, riego automático, paisajismo y mantenimiento de jardines en Paraguay. Solicitá asesoramiento y presupuesto.', alternates: { canonical: '/servicios/' } };
  if (!seo) return defaultMeta;
  const seoTitle = seo.title || defaultMeta.title; const seoDescription = seo.description || defaultMeta.description;
  return { title: seoTitle, description: seoDescription, keywords: seo.keywords ? seo.keywords.split(',').map((k:string)=>k.trim()) : undefined, alternates: defaultMeta.alternates, openGraph:{title:seoTitle,description:seoDescription,images:seo.og_image?[{url:seo.og_image}]:undefined}, twitter:{title:seoTitle,description:seoDescription,images:seo.og_image?[seo.og_image]:undefined} };
}

const dedicatedServices = [
  { title:'Instalación de césped natural', description:'Preparación del terreno, suministro y colocación profesional de césped para hogares, empresas y proyectos.', href:'/servicios/instalacion-de-cesped' },
  { title:'Riego automático', description:'Diseño e instalación de sistemas de riego para aprovechar mejor el agua y mantener áreas verdes.', href:'/servicios/riego-automatico' },
  { title:'Paisajismo', description:'Planificación y ejecución de espacios verdes funcionales, estéticos y adaptados al entorno.', href:'/servicios/paisajismo' },
  { title:'Mantenimiento de jardines', description:'Cuidado periódico para conservar césped, plantas y jardines en buenas condiciones.', href:'/servicios/mantenimiento-de-jardines' },
];

export default async function ServicesPage() {
  const services = await getServices();
  return <div className="min-h-screen bg-gray-50">
    <section className="bg-corpicia-green text-white py-16 md:py-24"><div className="container mx-auto px-4 text-center"><h1 className="text-4xl md:text-5xl font-bold mb-6">Servicios de césped, riego y paisajismo</h1><p className="text-xl text-white/90 max-w-3xl mx-auto">Soluciones integrales para hogares, empresas y proyectos en Paraguay: evaluamos, instalamos y acompañamos el mantenimiento de tu espacio verde.</p></div></section>
    <section className="container mx-auto px-4 py-12"><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{dedicatedServices.map(s=><Link href={s.href} key={s.href} className="bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow"><h2 className="text-lg font-bold">{s.title}</h2><p className="text-sm text-gray-600 mt-2">{s.description}</p><span className="inline-flex items-center gap-1 mt-4 text-corpicia-green font-semibold text-sm">Ver servicio <ArrowRight className="w-4 h-4"/></span></Link>)}</div></section>
    <section className="container mx-auto px-4 pb-16"><div className="grid md:grid-cols-2 gap-8">{services.map((service:any)=>{const Icon=service.icon||Settings;const hasImage=!!service.image_url;return <Card key={service.title||service.id} className="overflow-hidden"><CardContent className="p-0">{hasImage&&<div className="relative w-full aspect-video bg-gray-100"><Image src={service.image_url} alt={service.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy"/></div>}<div className="p-6">{!hasImage&&<div className="w-14 h-14 bg-corpicia-green/10 rounded-xl flex items-center justify-center mb-4"><Icon className="w-7 h-7 text-corpicia-green"/></div>}<h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3><p className="text-gray-600 mb-4">{service.description}</p>{service.features?.length>0&&<ul className="space-y-2 mt-4">{service.features.map((feature:string)=><li key={feature} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 bg-corpicia-green rounded-full"/>{feature}</li>)}</ul>}</div><div className="px-6 pb-6"><ServiceCTAButton serviceId={service.id||service.slug||service.title} serviceTitle={service.title} whatsappUrl={getWhatsAppUrl()} buttonLocation="service_card"/></div></CardContent></Card>})}</div></section>
    <section className="container mx-auto px-4 pb-16"><div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-sm"><h2 className="text-3xl font-bold text-gray-900 mb-4">¿Tenés un proyecto en mente?</h2><p className="text-gray-600 max-w-2xl mx-auto mb-8">Contanos qué necesitás y te orientamos sobre la solución más adecuada para tu espacio.</p><ServiceCTAButton serviceId="general-services-cta" serviceTitle="Consultas Generales de Servicios" whatsappUrl={getWhatsAppUrl()} buttonLocation="service_cta"><Button size="lg" className="gap-2">Hablar con un experto<ArrowRight className="w-5 h-5"/></Button></ServiceCTAButton></div></section>
  </div>;
}
