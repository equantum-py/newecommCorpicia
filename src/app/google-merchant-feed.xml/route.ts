import { getProducts } from '@/lib/repositories/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://www.corpicia.com';

function xmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(value: string | undefined | null) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function merchantPrice(product: any) {
  const price = Number(product.price_amount ?? product.pricePerM2 ?? product.price ?? 0);
  if (!Number.isFinite(price) || price <= 0) return null;
  return `${Math.round(price)} PYG`;
}

function descriptionFor(product: any) {
  return (
    product.short_description ||
    product.shortDescription ||
    product.description ||
    `${product.name} disponible en Corpicia Paraguay.`
  );
}

export async function GET() {
  const products = await getProducts();

  const items = (products || [])
    .filter((product: any) => product?.slug && product?.name)
    .map((product: any) => {
      const price = merchantPrice(product);
      const image = absoluteUrl(product.images?.[0] || product.image_url || product.image);
      if (!price || !image) return '';

      const id = product.id || product.slug;
      const link = `${SITE_URL}/productos/${encodeURIComponent(product.slug)}/`;
      const category = product.category || product.categories?.name || '';

      return `
    <item>
      <g:id>${xmlEscape(id)}</g:id>
      <g:title>${xmlEscape(product.name)}</g:title>
      <g:description>${xmlEscape(descriptionFor(product))}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${xmlEscape(price)}</g:price>
      <g:brand>Corpicia</g:brand>
      <g:identifier_exists>false</g:identifier_exists>${category ? `\n      <g:product_type>${xmlEscape(category)}</g:product_type>` : ''}
    </item>`;
    })
    .filter(Boolean)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Corpicia - Catálogo de productos</title>
    <link>${SITE_URL}</link>
    <description>Productos de Corpicia Paraguay para Google Merchant Center</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
