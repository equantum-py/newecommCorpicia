import { getProducts } from '@/lib/repositories/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpicia.com';

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatPrice(price: number): string {
  return `${Math.round(Number(price) || 0)} PYG`;
}

function getMerchantPrice(product: any): number {
  const tiers = Array.isArray(product.priceTiers) ? product.priceTiers : [];
  const baseTier = tiers
    .filter((tier: any) => Number(tier?.minQuantity) <= 1)
    .sort((a: any, b: any) => Number(a?.minQuantity || 0) - Number(b?.minQuantity || 0))[0];

  return Number(baseTier?.price ?? product.pricePerM2 ?? product.price_amount ?? 0);
}

export async function GET(): Promise<Response> {
  try {
    const products = await getProducts();
    const activeProducts = products.filter(
      (product: any) => product && product.slug && product.name && getMerchantPrice(product) > 0
    );

    const itemsXml = activeProducts
      .map((product: any) => {
        const link = `${SITE_URL}/productos/${product.slug}/`;
        const rawImage = Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : '/productos/default.jpg';
        const imageLink = rawImage.startsWith('http') ? rawImage : `${SITE_URL}${rawImage}`;
        const price = getMerchantPrice(product);

        return `    <item>
      <g:id>${escapeXml(product.id || product.slug)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription || product.description || product.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${escapeXml(formatPrice(price))}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.brand || 'Corpicia')}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Corpicia</title>
    <link>${SITE_URL}/</link>
    <description>Productos de jardinería y paisajismo de Corpicia</description>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('[Feed] No se pudo generar el catálogo:', error);
    return new Response('Feed temporalmente no disponible', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
