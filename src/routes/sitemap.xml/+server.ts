import type { RequestHandler } from './$types';
import { DESTINATIONS } from '$lib/config/destinations';
import { PUBLIC_SITE_URL } from '$env/static/public';

const BASE_URL = (PUBLIC_SITE_URL || 'https://qcs-cargo.com').replace(/\/+$/, '');

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/shipping-calculator', priority: 0.9, changefreq: 'weekly' },
  { url: '/track', priority: 0.8, changefreq: 'daily' },
  { url: '/pricing', priority: 0.8, changefreq: 'monthly' },
  { url: '/destinations', priority: 0.7, changefreq: 'monthly' },
  { url: '/prohibited-items', priority: 0.6, changefreq: 'monthly' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly' },
  { url: '/contact', priority: 0.5, changefreq: 'monthly' },
  { url: '/about', priority: 0.5, changefreq: 'monthly' },
  { url: '/services', priority: 0.5, changefreq: 'monthly' }
];

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  // Add destination pages if you have individual destination pages
  const destinationUrls = DESTINATIONS.map(dest => `
  <url>
    <loc>${BASE_URL}/destinations/${dest.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
${destinationUrls}
</urlset>`.trim();
}

export const GET: RequestHandler = async () => {
  const sitemap = generateSitemap();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};






