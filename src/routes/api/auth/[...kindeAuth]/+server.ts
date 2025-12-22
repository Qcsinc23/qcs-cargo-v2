import { handleAuth } from "@kinde-oss/kinde-auth-sveltekit";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(requestEvent: RequestEvent) {
	// #region agent log
	const debugLog = (msg: string, data: any, hyp: string) => {
		console.log(`[DEBUG][${hyp}] ${msg}:`, JSON.stringify(data));
		return fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[...kindeAuth]/+server.ts',message:msg,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hyp})}).catch(()=>{});
	};
	// #endregion
	
	// #region agent log
	await debugLog('handleAuth called', { url: requestEvent.url.pathname, search: requestEvent.url.search, hasCode: requestEvent.url.searchParams.has('code'), hasState: requestEvent.url.searchParams.has('state') }, 'A');
	// #endregion
	
	try {
		const result = await handleAuth(requestEvent);
		// #region agent log
		await debugLog('handleAuth success', { status: result.status, headers: Object.fromEntries(result.headers.entries()) }, 'A');
		// #endregion
		return result;
	} catch (error: any) {
		// #region agent log
		await debugLog('handleAuth error', { error: error?.message || String(error), stack: error?.stack?.slice(0, 500) }, 'E');
		// #endregion
		throw error;
	}
}

