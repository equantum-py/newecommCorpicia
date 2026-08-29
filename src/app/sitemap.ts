import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/repositories/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpicia.com')
    .trim()
    .replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/productos/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/presupuesto/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/servicios/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/nosotros/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contacto/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terminos/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacidad/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product: any) => product?.slug)
    .map((product: any) => ({
      url: `${baseUrl}/productos/${product.slug}/`,
      lastModified: product.updated_at || product.updatedAt
        ? new Date(product.updated_at || product.updatedAt)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...productRoutes];
}
