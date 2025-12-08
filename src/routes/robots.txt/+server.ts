import type { RequestHandler } from './$types';

const BASE_URL = 'https://qcscargo.com';

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

