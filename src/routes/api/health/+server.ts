import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const GET: RequestHandler = async () => {
  const checks: Record<string, boolean | string> = {
    app: true,
    timestamp: new Date().toISOString()
  };

  // Check database connectivity
  try {
    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    const health = await pb.health.check();
    checks.database = health.code === 200;
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.database = false;
  }

  // Check if all critical services are healthy
  const allHealthy = checks.app === true && checks.database === true;

  return json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    }
  );
};
