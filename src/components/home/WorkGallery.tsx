import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import type { WorkGallerySettings } from '@/lib/repositories/work-gallery';

export function WorkGallery({ settings, limit }: { settings: WorkGallerySettings; limit?: number }) {
  const items = settings.items.filter(item => item.active && item.image).slice(0, limit);
  if (!settings.active || items.length === 0) return null;
  return <section className="bg-[#f6f8f6] py-7 sm:py-12 md:py-14"><div className="container mx-auto px-4">
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-corpicia-green sm:text-xs">{settings.eyebrow}</p><h2 className="mt-1 text-xl font-bold sm:text-2xl md:text-3xl">{settings.title}</h2><p className="mt-2 max-w-2xl text-sm text-gray-600">{settings.description}</p></div>{limit&&<Link href="/proyectos" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-corpicia-green sm:inline-flex">Ver todos <ArrowRight className="h-4 w-4"/></Link>}</div>
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:pr-0 md:overflow-visible">{items.map(item=><article key={item.id} className="w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white shadow-sm md:w-auto md:max-w-none"><div className="relative aspect-[4/3]"><Image src={item.image} alt={`${item.title} - trabajo realizado por Corpicia`} fill className="object-cover" sizes="(max-width:767px) 82vw,33vw"/></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-corpicia-green">{item.category}</p><h3 className="mt-1 text-base font-bold sm:text-lg">{item.title}</h3>{item.location&&<p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5"/>{item.location}</p>}{item.description&&<p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.description}</p>}</div></article>)}</div>
    {limit&&<Link href="/proyectos" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-corpicia-green sm:hidden">Ver todos los trabajos <ArrowRight className="h-4 w-4"/></Link>}
  </div></section>;
}
