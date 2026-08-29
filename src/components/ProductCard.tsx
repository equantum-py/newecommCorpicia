'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatUnit, getWhatsAppUrl } from '@/lib/utils';
import { Product } from '@/types';
import { ImageIcon, MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/tracking';

interface ProductCardProps {
  product: Product;
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

        <div className="mt-auto flex items-center gap-2">
          <Link
            href={productPath}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-corpicia-green sm:text-sm"
          >
            Ver producto
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            aria-label={`Consultar ${product.name} por WhatsApp`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-white transition-all hover:bg-[#1fbd5b] hover:shadow-md sm:text-sm"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">Consultar</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
