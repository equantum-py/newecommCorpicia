import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Product, PriceTier } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatUnit(unit: Product['unit']): string {
  switch (unit) {
    case 'm2': return 'm²';
    case 'kg': return 'kg';
    case 'bolsa': return 'bolsa';
    case 'bolsa_30kg': return 'Bolsa de 30 (kg)';
    case 'bolsa_50kg': return 'Bolsa de 50 (kg)';
    case 'litro': return 'litro';
    case 'metro_lineal': return 'metro lineal';
    case 'docena': return 'docena';
    case 'unidad': return 'unidad';
    case 'visita': return 'visita';
    case 'servicio': return 'servicio';
    default: return 'unidad';
  }
}

export function getWhatsAppUrl(message?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '595992588770';
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${phone}${encodedMessage}`;
}

export function getSafeMinQuantity(product: any): number {
  if (!product) return 1;
  const raw = product.minQuantity ?? product.minOrderQuantity ?? product.min_order_quantity ?? 1;
  const min = Number(raw);
  return Number.isFinite(min) && min > 0 ? min : 1;
}

export function getProductImage(product: any): string {
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  if (product?.image) return product.image;
  if (product?.imageUrl) return product.imageUrl;
  if (product?.slug) return `/productos/${product.slug}.jpg`;
  return '';
}

export function getSafeQuantity(quantity: any, safeMinQuantity: number): number {
  const numQty = Number(quantity);
  const parsed = Number.isFinite(numQty) ? numQty : safeMinQuantity;
  return Math.max(parsed, safeMinQuantity);
}

type NormalizedTier = PriceTier & { minQuantity?: number; maxQuantity?: number | null };

function normalizeTier(tier: NormalizedTier) {
  const min = Number(tier.min ?? tier.minQuantity ?? 0);
  const maxRaw = tier.max ?? tier.maxQuantity;
  const max = maxRaw === null || maxRaw === undefined || maxRaw === '' as any ? null : Number(maxRaw);
  const price = Number(tier.price);
  return {
    tier,
    min: Number.isFinite(min) ? min : 0,
    max: max === null || Number.isFinite(max) ? max : null,
    price: Number.isFinite(price) ? price : 0,
  };
}

export function getPriceForQuantity(product: Product, quantity: number): {
  unitPrice: number;
  totalPrice: number;
  activeTier: PriceTier | null;
} {
  const safeMinQuantity = getSafeMinQuantity(product);
  const safeQuantity = getSafeQuantity(quantity, safeMinQuantity);
  const basePrice = Math.max(0, Number(product.pricePerM2) || 0);

  const tiers = (product.priceTiers || [])
    .map((tier) => normalizeTier(tier as NormalizedTier))
    .filter((tier) => tier.min > 0 && tier.price > 0 && (tier.max === null || tier.max >= tier.min))
    .sort((a, b) => b.min - a.min);

  const match = tiers.find(({ min, max }) => safeQuantity >= min && (max === null || safeQuantity <= max));
  const unitPrice = match?.price ?? basePrice;

  return {
    unitPrice,
    totalPrice: unitPrice * safeQuantity,
    activeTier: match?.tier ?? null,
  };
}

export function generateSlug(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export function generateWhatsAppMessage(
  items: { name: string; quantity: number; total: number; unit: Product['unit']; unitPrice?: number }[],
  total: number
): string {
  let message = 'Hola, quiero solicitar un presupuesto:\n\n';
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `Cantidad: ${item.quantity} ${formatUnit(item.unit)}\n`;
    if (item.unitPrice !== undefined) message += `Precio aplicado: ${formatPrice(item.unitPrice)}/${formatUnit(item.unit)}\n`;
    message += `Subtotal: ${formatPrice(item.total)}\n\n`;
  });
  message += `Total estimado: ${formatPrice(total)}\n\n`;
  message += 'Nombre:\nZona:\nComentario:';
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '595992588770';
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}