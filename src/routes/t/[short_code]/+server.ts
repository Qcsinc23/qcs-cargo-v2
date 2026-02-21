import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const { short_code } = params;

  // Redirect to the public tracking page with the short code as the query
  throw redirect(302, `/track?q=${encodeURIComponent(short_code)}`);
};
