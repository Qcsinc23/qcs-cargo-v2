import type { RequestHandler } from './$types';
import { PUBLIC_SITE_URL } from '$env/static/public';

const BASE_URL = (PUBLIC_SITE_URL || 'https://qcscargo.com').replace(/\/+$/, '');

export const GET: RequestHandler = async () => {
  const robotsTxt = `# QCS Cargo Robots.txt
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/reset-password

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=86400'
    }
  });
};






