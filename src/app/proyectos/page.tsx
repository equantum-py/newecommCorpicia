import type { Metadata } from 'next';
import { WorkGallery } from '@/components/home/WorkGallery';
import { getWorkGallerySettings } from '@/lib/repositories/work-gallery.server';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Trabajos realizados de césped, riego y paisajismo | Corpicia',
  description: 'Conocé trabajos realizados por Corpicia en césped natural, sistemas de riego automático y paisajismo en Paraguay.',
  alternates: { canonical: '/proyectos' },
};

export default async function ProyectosPage() {
  const gallery = await getWorkGallerySettings();
  return <main><section className="bg-[#073d22] py-10 text-white sm:py-16"><div className="container mx-auto px-4"><p className="text-xs font-bold uppercase tracking-widest text-green-300">Corpicia</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Nuestros trabajos</h1><p className="mt-3 max-w-2xl text-white/80">Proyectos reales de césped, riego y paisajismo realizados para hogares, empresas y profesionales.</p></div></section><WorkGallery settings={{...gallery, active:true}} /></main>;
}
