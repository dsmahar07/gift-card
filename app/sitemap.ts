import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { getAllGiftCards } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  try {
    // Get all gift cards and extract unique brands
    const giftCards = await getAllGiftCards({});
    const brands = [...new Set(giftCards.map(card => card.brand))];
    
    // Add dynamic store pages
    const storePages = brands.map((brand) => {
      const brandSlug = brand
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      return {
        url: `${baseUrl}/store/${brandSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });

    return [...routes, ...storePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
