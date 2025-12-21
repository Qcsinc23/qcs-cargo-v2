import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// #region agent log
const debugLog = (msg: string, data: any, hyp: string) => fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/+layout.server.ts',message:msg,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hyp})}).catch(()=>{});
// #endregion

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // #region agent log
  await debugLog('dashboard load entry', { hasUser: !!locals.user, userType: typeof locals.user, path: url.pathname }, 'C');
  // #endregion
  
  // Protect dashboard routes - require authentication
  if (!locals.user) {
    // #region agent log
    await debugLog('dashboard redirecting to login (no user)', {}, 'C');
    // #endregion
    // Redirect to Kinde login - post_login_redirect_url handles the redirect back
    throw redirect(302, '/api/auth/login');
  }

  // #region agent log
  await debugLog('dashboard returning user', { userId: (locals.user as any)?.id, email: (locals.user as any)?.email }, 'C');
  // #endregion
  
  return {
    user: locals.user
  };
};

