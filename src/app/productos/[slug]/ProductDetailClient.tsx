'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Package,
  ShoppingCart,
} from 'lucide-react';

import { QuantitySelector } from '@/components/QuantitySelector';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';

import {
  trackAddToBudget,
  trackProductView,
  trackWhatsAppClick,
} from '@/lib/tracking';
import {
  formatPrice,
  formatUnit,
  getPriceForQuantity,
  getWhatsAppUrl,
} from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import type { Product } from '@/types';

type ProductDetailType = Product & {
  minOrderQuantity?: number;
  features?: string[];
  specifications?: Record<string, string>;
  recommendations?: string[];
};

type Props = {
  product: ProductDetailType;
  relatedProducts: Product[];
};

type NormalizedTier = NonNullable<Product['priceTiers']>[number] & {
  min?: number;
  max?: number | null;
  minQuantity?: number;
  maxQuantity?: number | null;
};

function getCalculatedQuantity(product: ProductDetailType, quantity: number) {
  const minimum = Number(product.minOrderQuantity ?? product.minQuantity) || 1;
  const safeQuantity = Math.max(Number(quantity) || minimum, minimum);
  if (product.unit === 'docena') return safeQuantity * 12;
  if (product.unit === 'visita' || product.unit === 'servicio') return 1;
  return safeQuantity;
}

function getTierMinimum(tier: NormalizedTier) {
  return Number(tier.min ?? tier.minQuantity) || 0;
}

function getTierMaximum(tier: NormalizedTier) {
  const value = tier.max ?? tier.maxQuantity;
  return value === undefined || value === null ? null : Number(value);
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const addItem = useBudgetStore((state) => state.addItem);
  const minimumQuantity = Number(product.minOrderQuantity ?? product.minQuantity) || 1;
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wasAdded, setWasAdded] = useState(false);

  useEffect(() => {
    trackProductView(product.name, product.slug);
  }, [product.name, product.slug]);

  const safeQuantity = Math.max(Number(quantity) || minimumQuantity, minimumQuantity);
  const { unitPrice, totalPrice } = useMemo(
    () => getPriceForQuantity(product, safeQuantity),
    [product, safeQuantity]
  );

  const priceTiers = useMemo(
    () => [...(product.priceTiers ?? [])]
      .map((tier) => tier as NormalizedTier)
      .sort((a, b) => getTierMinimum(a) - getTierMinimum(b)),
    [product.priceTiers]
  );

  const lowestTierPrice = useMemo(() => {
    if (priceTiers.length === 0) return null;
    return Math.min(...priceTiers.map((tier) => tier.price));
  }, [priceTiers]);

  const nextTier = useMemo(
    () => priceTiers.find((tier) => getTierMinimum(tier) > safeQuantity),
    [priceTiers, safeQuantity]
  );

  const features = product.features ?? [];
  const specifications = product.specifications ?? {};
  const recommendations = product.recommendations ?? [];
  const related = relatedProducts ?? [];
  const fallbackImage = `/productos/${product.slug}.jpg`;
  const images = product.images && product.images.length > 0 ? product.images : [fallbackImage];
  const selectedImage = images[selectedImageIndex] ?? images[0] ?? fallbackImage;

  const handleAdd = () => {
    const calculatedQuantity = getCalculatedQuantity(product, safeQuantity);
    addItem(product, calculatedQuantity);
    trackAddToBudget(product.name, product.slug, safeQuantity);
    setWasAdded(true);
    window.setTimeout(() => setWasAdded(false), 2000);
  };

  const whatsappMessage = `Hola, quiero consultar por ${product.name}. Cantidad: ${safeQuantity} ${formatUnit(product.unit)}.`;

  return (
    <main className="min-h-screen bg-[#f6f8f6]">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Link href="/productos" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-corpicia-green">
          <ArrowLeft size={17} /> Volver a productos
        </Link>

        <section className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)] lg:gap-10">
          <div className="min-w-0">
            <div className="relative h-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:h-[380px] lg:h-[560px]">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain p-3 sm:p-4 lg:p-6"
              />
              {product.isFeatured && (
                <span className="absolute left-4 top-4 rounded-full bg-corpicia-green px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">Destacado</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => {
                  const isSelected = selectedImageIndex === index;
                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                      aria-pressed={isSelected}
                      className={`relative h-20 w-20 flex-none overflow-hidden rounded-xl border-2 bg-white transition ${isSelected ? 'border-corpicia-green ring-2 ring-corpicia-green/15' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <Image src={image} alt="" fill sizes="80px" className="object-contain p-1" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-7 hidden space-y-5 lg:block">
              {product.description && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-corpicia-green">Conocé el producto</p>
                  <h2 className="mt-2 text-xl font-semibold text-gray-950">Descripción del producto</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">{product.description}</p>
                </section>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-medium text-gray-950">Detalles del producto</h2>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  {features.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Características</h3>
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Check size={17} className="mt-0.5 flex-none text-corpicia-green" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(specifications).length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Especificaciones</h3>
                      <dl className="divide-y divide-gray-100">
                        {Object.entries(specifications).map(([label, value]) => (
                          <div key={label} className="flex justify-between gap-4 py-2.5 text-sm">
                            <dt className="text-gray-500">{label}</dt>
                            <dd className="text-right font-medium text-gray-900">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                {recommendations.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <h3 className="mb-3 text-base font-semibold text-gray-900">Recomendaciones de uso</h3>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
                      {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="space-y-5 lg:sticky lg:top-24">
              <header>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-corpicia-green">Producto Corpicia</p>
                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-950 md:text-4xl">{product.name}</h1>
                {product.shortDescription && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-semibold leading-relaxed text-red-700 md:text-base">{product.shortDescription}</p>
                  </div>
                )}
              </header>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 bg-gradient-to-br from-green-50 to-white">
                  <div className="p-4 md:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Precio aplicado</p>
                    <p className="mt-1 text-2xl font-bold text-corpicia-green md:text-3xl">{formatPrice(unitPrice)}</p>
                    <p className="mt-1 text-sm text-gray-500">por {formatUnit(product.unit)}</p>
                  </div>
                  <div className="p-4 md:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Compra mínima</p>
                    <p className="mt-1 text-2xl font-bold text-gray-950 md:text-3xl">{minimumQuantity}</p>
                    <p className="mt-1 text-sm text-gray-500">{formatUnit(product.unit)}</p>
                  </div>
                </div>

                <div className="space-y-5 p-4 md:p-5">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-gray-900">Cantidad</label>
                      <span className="text-xs text-gray-500">Mínimo: {minimumQuantity} {formatUnit(product.unit)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <QuantitySelector quantity={safeQuantity} minQuantity={minimumQuantity} onChange={setQuantity} />
                      <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">{formatUnit(product.unit)}</span>
                    </div>
                  </div>

                  {priceTiers.length > 0 && (
                    <div className="border-t border-gray-100 pt-5">
                      <h2 className="text-base font-semibold text-gray-950">Precios por cantidad</h2>
                      <div className="mt-3 space-y-2">
                        {priceTiers.map((tier, index) => {
                          const min = getTierMinimum(tier);
                          const max = getTierMaximum(tier);
                          const isActive = safeQuantity >= min && (max === null || safeQuantity <= max);
                          const isLowestPrice = tier.price === lowestTierPrice;
                          const label = max !== null ? `${min} a ${max} ${formatUnit(product.unit)}` : `Desde ${min} ${formatUnit(product.unit)}`;
                          return (
                            <div key={`${min}-${index}`} className={`rounded-xl border p-3 transition ${isActive ? 'border-corpicia-green bg-green-50' : 'border-gray-200 bg-white'}`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-sm ${isActive ? 'font-semibold text-green-900' : 'text-gray-700'}`}>{label}</span>
                                  {isActive && <span className="rounded-full bg-corpicia-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Aplicado</span>}
                                  {isLowestPrice && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Mejor precio</span>}
                                </div>
                                <span className="whitespace-nowrap text-sm font-bold text-gray-950">{formatPrice(tier.price)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {nextTier ? (
                        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                          Agregá {getTierMinimum(nextTier) - safeQuantity} {formatUnit(product.unit)} más para acceder a {formatPrice(nextTier.price)} por {formatUnit(product.unit)}.
                        </p>
                      ) : (
                        <p className="mt-3 rounded-lg bg-green-50 p-3 text-xs text-green-800">Ya tenés el mejor precio disponible.</p>
                      )}
                    </div>
                  )}

                  <div className="rounded-xl bg-gray-950 p-4 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Total estimado</p>
                        <p className="mt-1 text-2xl font-bold md:text-3xl">{formatPrice(totalPrice)}</p>
                      </div>
                      <div className="text-right text-xs leading-relaxed text-gray-400">
                        {safeQuantity} {formatUnit(product.unit)}<br />× {formatPrice(unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button type="button" onClick={handleAdd} disabled={wasAdded} className="h-12 w-full text-base">
                      {wasAdded ? <><CheckCircle2 size={19} className="mr-2" />Agregado al presupuesto</> : <><ShoppingCart size={19} className="mr-2" />Agregar al presupuesto</>}
                    </Button>
                    <a href={getWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick('pdp', product.slug)} className="block">
                      <Button type="button" variant="outline" className="h-12 w-full">Consultar por WhatsApp</Button>
                    </a>
                  </div>

                  <div className="flex items-start gap-3 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                    <Package size={17} className="mt-0.5 flex-none text-corpicia-green" />
                    <p>Producto sujeto a disponibilidad. El precio aplicado depende de la cantidad seleccionada.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:hidden">
                {product.description && (
                  <details className="group rounded-xl border border-gray-200 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                      <span className="text-base font-medium text-gray-950">Descripción del producto</span>
                      <span className="text-xl font-light text-corpicia-green transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                      <p className="text-sm font-normal leading-6 text-gray-600">{product.description}</p>
                    </div>
                  </details>
                )}

                <details className="group rounded-xl border border-gray-200 bg-white shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                    <span className="text-base font-medium text-gray-950">Características y especificaciones</span>
                    <span className="text-xl font-light text-corpicia-green transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="border-t border-gray-100 px-4 pb-4 pt-1">
                    {features.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Check size={16} className="mt-0.5 flex-none text-corpicia-green" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {Object.keys(specifications).length > 0 && (
                      <dl className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
                        {Object.entries(specifications).map(([label, value]) => (
                          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                            <dt className="text-gray-500">{label}</dt>
                            <dd className="text-right font-medium text-gray-900">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {recommendations.length > 0 && (
                      <div className="mt-5 border-t border-gray-100 pt-5">
                        <h3 className="text-base font-semibold text-gray-900">Recomendaciones de uso</h3>
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
                          {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14 md:mt-20">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-corpicia-green">Completá tu proyecto</p>
                <h2 className="mt-1 text-2xl font-semibold text-gray-950">También te puede interesar</h2>
              </div>
              <Link href="/productos" className="text-sm font-semibold text-corpicia-green hover:underline">Ver todos</Link>
            </div>
            <div className="flex snap-x gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0">
              {related.map((relatedProduct) => (
                <div key={relatedProduct.id} className="min-w-[72%] snap-start sm:min-w-[46%] md:min-w-0">
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
