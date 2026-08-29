'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatUnit, getWhatsAppUrl } from '@/lib/utils';
import { Product } from '@/types';
import { ImageIcon } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/tracking';

interface ProductCardProps {
  product: Product;
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.895a9.825 9.825 0 0 1 2.9 6.988c-.002 5.45-4.437 9.884-9.892 9.884m8.413-18.297A11.815 11.815 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.14 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.689 1.448h.005c6.557 0 11.892-5.335 11.895-11.893a11.821 11.821 0 0 0-3.487-8.413Z" />
    </svg>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const productPath = `/productos/${product.slug}/`;

  const whatsappMessage = [
    'Hola Corpicia, quiero consultar por este producto:',
    '',
    `*${product.name}*`,
    `https://www.corpicia.com${productPath}`,
    '',
    '¿Podrían ayudarme con disponibilidad y cotización?',
  ].join('\n');

  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('product_card', product.slug);
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg">
      <Link href={productPath} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f6f4] sm:aspect-square">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
              sizes="(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}

          {product.isFeatured && (
            <Badge className="absolute left-2.5 top-2.5 bg-corpicia-green px-2.5 py-1 text-[10px] font-semibold text-white sm:text-xs">
              Destacado
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-3.5 sm:p-4">
        <Link href={productPath} className="block">
          <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-corpicia-green sm:text-base">
            {product.name}
          </h3>
        </Link>

        <p className="mb-3 hidden line-clamp-2 text-sm leading-relaxed text-gray-500 sm:block">
          {product.shortDescription || product.description}
        </p>

        <div className="mb-3 flex min-h-[42px] flex-col justify-end gap-0.5">
          {product.priceTiers && product.priceTiers.length > 0 ? (() => {
            const lowestTier = product.priceTiers.reduce((prev, curr) => curr.price < prev.price ? curr : prev);
            return (
              <>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">Desde</span>
                  <span className="text-base font-extrabold text-corpicia-green sm:text-lg">
                    {formatPrice(lowestTier.price)}
                  </span>
                  <span className="text-[10px] text-gray-400 sm:text-xs">/ {formatUnit(product.unit)}</span>
                </div>
                <p className="hidden text-xs text-gray-500 sm:block">
                  En compras desde {
                    (lowestTier as typeof lowestTier & { minQuantity?: number }).min ??
                    (lowestTier as typeof lowestTier & { minQuantity?: number }).minQuantity ??
                    0
                  } {formatUnit(product.unit)}
                </p>
              </>
            );
          })() : (
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-base font-extrabold text-corpicia-green sm:text-lg">
                {formatPrice(product.pricePerM2)}
              </span>
              <span className="text-[10px] text-gray-400 sm:text-xs">/ {formatUnit(product.unit)}</span>
            </div>
          )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          aria-label={`Consultar ${product.name} por WhatsApp`}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-center text-xs font-bold text-white transition-all hover:bg-[#1fbd5b] hover:shadow-md sm:text-sm"
        >
          <WhatsAppIcon className="h-[18px] w-[18px] shrink-0 text-white" />
          <span>Consultar por WhatsApp</span>
        </a>
      </CardContent>
    </Card>
  );
}
