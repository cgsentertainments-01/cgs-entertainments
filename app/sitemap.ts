import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cgsentertainments.com';

  const staticRoutes = [
    '',
    '/events',
    '/categories',
    '/gallery',
    '/guests-judges',
    '/faqs',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/certificates',
    '/login',
    '/register',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/events' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/events' ? 0.9 : 0.7,
  }));

  try {
    const { data: events } = await supabase
      .from('events')
      .select('slug, id, updated_at')
      .eq('is_published', true);

    if (events && events.length > 0) {
      events.forEach((event) => {
        const identifier = event.slug || event.id;
        if (identifier) {
          sitemapEntries.push({
            url: `${baseUrl}/events/${identifier}`,
            lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
  }

  return sitemapEntries;
}
