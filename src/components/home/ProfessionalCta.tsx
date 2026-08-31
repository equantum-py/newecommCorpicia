import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ProfessionalCtaSettings } from '@/lib/repositories/professional-cta';
import { getWorkGallerySettings } from '@/lib/repositories/work-gallery.server';
import { WorkGallery } from '@/components/home/WorkGallery';

type Props = { settings: ProfessionalCtaSettings };

export async function ProfessionalCta({ settings }: Props) {
  const gallery = await getWorkGallerySettings();
  const gallerySection = <WorkGallery settings={gallery} limit={6} />;
  if (!settings.enabled) return gallerySection;

  const desktopImage = settings.desktop_image_url || settings.image_url;
  const mobileImage = settings.mobile_image_url || desktopImage;
  const whatsapp = `https://wa.me/595992588770?text=${encodeURIComponent(settings.whatsapp_message)}`;

  return <>
    {gallerySection}
    <section className="pb-14 pt-7 md:pb-16 md:pt-10"><div className="container mx-auto px-4"><div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#f7f9f6] shadow-sm"><div className="grid items-stretch md:grid-cols-[45%_55%]">
      <div className="relative min-h-[340px] bg-[#eef3ed] sm:min-h-[420px] md:min-h-[520px]">
        {mobileImage?<div className="absolute inset-0 md:hidden"><Image src={mobileImage} alt="Corpicia para jardineros y paisajistas" fill sizes="100vw" className="object-contain bg-[#eef3ed]"/></div>:null}
        {desktopImage?<div className="absolute inset-0 hidden md:block"><Image src={desktopImage} alt="Corpicia para jardineros y paisajistas" fill sizes="45vw" className="object-contain bg-[#eef3ed]"/></div>:null}
        {!desktopImage&&!mobileImage?<div className="absolute inset-0 flex items-center justify-center p-8 text-center text-gray-500"><div><p className="font-semibold text-gray-700">Imagen para profesionales</p><p className="mt-1 text-sm">Cargala desde el panel administrativo.</p></div></div>:null}
      </div>
      <div className="flex items-center p-5 sm:p-7 md:p-10 lg:p-12"><div className="max-w-xl">
        {settings.eyebrow?<p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-corpicia-green">{settings.eyebrow}</p>:null}
        <h2 className="text-[28px] font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">{settings.title}</h2>
        <p className="mt-4 leading-relaxed text-gray-600">{settings.description}</p>
        <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2"><Benefit text={settings.benefit_1}/><Benefit text={settings.benefit_2}/><Benefit text={settings.benefit_3}/><Benefit text={settings.benefit_4}/></div>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-corpicia-green px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto">{settings.button_text}<ArrowRight className="h-4 w-4"/></a>
      </div></div>
    </div></div></div></section>
  </>;
}

function Benefit({ text }: { text: string }) { return <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-corpicia-green"/>{text}</div>; }
