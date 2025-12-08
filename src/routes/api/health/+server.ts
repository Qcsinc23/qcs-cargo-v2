import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const checks = {
    database: 'unknown',
    timestamp: new Date().toISOString()
  };

  try {
    // Check PocketBase connection
    await locals.pb.health.check();
    checks.database = 'healthy';
  } catch (e) {
    checks.database = 'unhealthy';
  }

  const isHealthy = checks.database === 'healthy';

  return json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      version: '2.0.0',
      ...checks
    },
    { status: isHealthy ? 200 : 503 }
  );
};