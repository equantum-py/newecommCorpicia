'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/utils';
import { trackBannerClick } from '@/lib/tracking';

type Banner = { id?: string; title: string | null; subtitle: string | null; imageDesktop?: string; imageMobile?: string; image_desktop?: string; image_mobile?: string; cta_text?: string | null; cta_link?: string | null; CTA?: string | null; link?: string | null };
type BannerCarouselProps = { banners: Banner[]; variant?: 'hero-grid' | 'single' };

function getBannerLinks(banner: Banner) {
  const desktopImg = banner.image_desktop || banner.imageDesktop || '';
  const mobileImg = banner.image_mobile || banner.imageMobile || desktopImg;
  return { desktopImg, mobileImg, linkUrl: banner.cta_link || banner.link || getWhatsAppUrl() };
}

export function BannerCarousel({ banners, variant = 'single' }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chunkSize = variant === 'hero-grid' ? 3 : 1;
  const chunks: Banner[][] = [];
  for (let i = 0; i < banners.length; i += chunkSize) chunks.push(banners.slice(i, i + chunkSize));

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (chunks.length > 1 && !isHovered) timeoutRef.current = setTimeout(() => setCurrentIndex((p) => p === chunks.length - 1 ? 0 : p + 1), 5000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [currentIndex, chunks.length, isHovered]);

  const goToNext = () => setCurrentIndex((p) => p === chunks.length - 1 ? 0 : p + 1);
  const goToPrev = () => setCurrentIndex((p) => p === 0 ? chunks.length - 1 : p - 1);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) goToNext();
    if (distance < -50) goToPrev();
    setTouchStart(0); setTouchEnd(0);
  };

  if (!banners?.length) return null;
  if (chunks.length === 1) return variant === 'hero-grid' ? <HeroGridChunk chunk={chunks[0]} isFirst /> : <SingleChunk chunk={chunks[0]} />;

  return (
    <div className="relative w-full overflow-hidden group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)} onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)} onTouchEnd={handleTouchEnd}>
      <div className="flex transition-transform duration-500 ease-in-out w-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {chunks.map((chunk, index) => <div key={index} className="w-full flex-shrink-0">{variant === 'hero-grid' ? <HeroGridChunk chunk={chunk} isFirst={index === 0} /> : <SingleChunk chunk={chunk} />}</div>)}
      </div>
      <button onClick={(e) => { e.preventDefault(); goToPrev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-gray-900 items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md z-10 hidden md:flex" aria-label="Banner anterior"><ChevronLeft className="w-6 h-6" /></button>
      <button onClick={(e) => { e.preventDefault(); goToNext(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-gray-900 items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md z-10 hidden md:flex" aria-label="Banner siguiente"><ChevronRight className="w-6 h-6" /></button>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">{chunks.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`min-w-11 min-h-11 flex items-center justify-center rounded-full ${currentIndex === index ? 'text-corpicia-green' : 'text-gray-600'}`} aria-label={`Mostrar grupo de banners ${index + 1}`}><span className={`block h-2.5 rounded-full shadow-sm ${currentIndex === index ? 'bg-corpicia-green w-6' : 'bg-white w-2.5'}`} /></button>)}</div>
    </div>
  );
}

function SingleChunk({ chunk }: { chunk: Banner[] }) {
  if (!chunk[0]) return null;
  const banner = chunk[0];
  const { desktopImg, mobileImg, linkUrl } = getBannerLinks(banner);
  return <Link href={linkUrl} className="block w-full" onClick={() => trackBannerClick(banner.id || banner.title || 'unknown', 'secondary', { title: banner.title, destination_url: linkUrl })}>
    <div className="relative w-full aspect-[16/9] lg:h-[380px] rounded-xl overflow-hidden bg-[#f5fbf6]">
      <div className="block sm:hidden w-full h-full relative"><Image src={mobileImg} alt={banner.title || 'Banner Corpicia'} fill className="object-contain" sizes="100vw" quality={75} loading="lazy" /></div>
      <div className="hidden sm:block w-full h-full relative"><Image src={desktopImg} alt={banner.title || 'Banner Corpicia'} fill className="object-contain" sizes="(min-width: 1024px) 66vw, 100vw" quality={75} loading="lazy" /></div>
    </div>
  </Link>;
}

function HeroGridChunk({ chunk, isFirst = false }: { chunk: Banner[]; isFirst?: boolean }) {
  const mainBanner = chunk[0]; const sideBanner1 = chunk[1]; const sideBanner2 = chunk[2];
  const mainLinks = mainBanner ? getBannerLinks(mainBanner) : null; const side1Links = sideBanner1 ? getBannerLinks(sideBanner1) : null; const side2Links = sideBanner2 ? getBannerLinks(sideBanner2) : null;
  return <div className="w-full">
    <div className="block md:hidden space-y-3">
      {mainBanner && mainLinks && <Link href={mainLinks.linkUrl} className="block" onClick={() => trackBannerClick(mainBanner.id || mainBanner.title || 'unknown', 'hero', { title: mainBanner.title, destination_url: mainLinks.linkUrl, position: 'main' })}>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5fbf6]"><Image src={mainLinks.mobileImg} alt={mainBanner.title || 'Banner principal'} fill className="object-cover" sizes="100vw" quality={78} priority={isFirst} fetchPriority={isFirst ? 'high' : 'auto'} /></div>
      </Link>}
      {(sideBanner1 || sideBanner2) && <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {sideBanner1 && side1Links && <Link href={side1Links.linkUrl} className="block flex-shrink-0 w-[85%] snap-start"><div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#f5fbf6]"><Image src={side1Links.mobileImg} alt={sideBanner1.title || 'Banner lateral'} fill className="object-cover" sizes="85vw" quality={72} loading="lazy" /></div></Link>}
        {sideBanner2 && side2Links && <Link href={side2Links.linkUrl} className="block flex-shrink-0 w-[85%] snap-start"><div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#f5fbf6]"><Image src={side2Links.mobileImg} alt={sideBanner2.title || 'Banner lateral'} fill className="object-cover" sizes="85vw" quality={72} loading="lazy" /></div></Link>}
      </div>}
    </div>
    <div className="hidden md:grid gap-4 lg:grid-cols-[2fr_1fr]">
      {mainBanner && mainLinks ? <Link href={mainLinks.linkUrl} className="block"><div className="relative w-full aspect-[16/9] lg:h-[500px] rounded-xl overflow-hidden bg-[#f5fbf6]"><Image src={mainLinks.desktopImg} alt={mainBanner.title || 'Banner principal'} fill className="object-contain" sizes="(min-width: 1024px) 66vw, 100vw" quality={78} priority={isFirst} fetchPriority={isFirst ? 'high' : 'auto'} /></div></Link> : <div className="relative w-full aspect-[16/9] lg:h-[500px] rounded-xl bg-gray-100" />}
      <div className="grid gap-4">
        {sideBanner1 && side1Links ? <Link href={side1Links.linkUrl} className="block h-full"><div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#f5fbf6] h-full"><Image src={side1Links.desktopImg} alt={sideBanner1.title || 'Banner lateral'} fill className="object-contain" sizes="33vw" quality={72} loading="lazy" /></div></Link> : <div className="relative w-full aspect-[16/9] rounded-xl bg-gray-50" />}
        {sideBanner2 && side2Links ? <Link href={side2Links.linkUrl} className="block h-full"><div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#f5fbf6] h-full"><Image src={side2Links.desktopImg} alt={sideBanner2.title || 'Banner lateral'} fill className="object-contain" sizes="33vw" quality={72} loading="lazy" /></div></Link> : <div className="relative w-full aspect-[16/9] rounded-xl bg-gray-50" />}
      </div>
    </div>
  </div>;
}
