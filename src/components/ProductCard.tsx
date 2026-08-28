'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatUnit } from '@/lib/utils';
import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';
import { trackAddToBudget } from '@/lib/tracking';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useBudgetStore((state) => state.addItem);

  const handleAddToBudget = () => {
    addItem(product, product.minQuantity);
    trackAddToBudget(product.name, product.slug, product.minQuantity);
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/productos/${product.slug}/`} className="block">
        <div className="relative aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ShoppingCart />
            </div>
          )}

          {product.isFeatured && (
            <Badge className="absolute left-2 top-2 bg-amber-500 px-2 py-0.5 text-[10px] sm:text-xs">
              Destacado
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/productos/${product.slug}/`}>
          <h3 className="text-sm sm:text-base font-semibold line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-corpicia-green">
            {product.name}
          </h3>
        </Link>

        <p className="hidden sm:block text-sm text-gray-500 line-clamp-2 mb-3">
          {product.shortDescription || product.description}
        </p>

        <div className="mb-2.5 sm:mb-3 flex flex-col gap-1">
          {product.priceTiers && product.priceTiers.length > 0 ? (() => {
            const lowestTier = product.priceTiers.reduce((prev, curr) => curr.price < prev.price ? curr : prev);
            return (
              <>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-[11px] sm:text-sm font-medium text-gray-500">Desde</span>
                  <span className="text-base sm:text-lg font-bold text-corpicia-green">
                    {formatPrice(lowestTier.price)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">/ {formatUnit(product.unit)}</span>
                </div>
                <p className="hidden sm:block text-xs text-gray-500">
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
              <span className="text-base sm:text-lg font-bold text-corpicia-green">
                {formatPrice(product.pricePerM2)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400">/ {formatUnit(product.unit)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleAddToBudget}
            className="w-full h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Agregar al Presupuesto</span>
            <span className="sm:hidden">Cotizar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
