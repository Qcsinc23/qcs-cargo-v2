import PocketBase from 'pocketbase';
import type { User } from '@kinde-oss/kinde-auth-sveltekit';

/**
 * Syncs a Kinde user to PocketBase
 * 
 * This function:
 * 1. Searches for an existing PocketBase user by email
 * 2. If found: Updates name, email_verified, and kinde_id if changed
 * 3. If not found: Creates new PocketBase user with Kinde data
 * 4. Returns the PocketBase user record
 * 
 * @param kindeUser - The authenticated Kinde user object
 * @param pb - Authenticated PocketBase instance (must be admin-authenticated)
 * @returns The PocketBase user record
 */
export async function syncKindeUserToPocketBase(
  kindeUser: User,
  pb: PocketBase
): Promise<any> {
  const kindeId = kindeUser.id || (kindeUser as any).sub;
  const email = kindeUser.email;
  const emailVerified = (kindeUser as any).email_verified || false;
  
  // Build name from Kinde user data
  const name = kindeUser.given_name && kindeUser.family_name
    ? `${kindeUser.given_name} ${kindeUser.family_name}`
    : kindeUser.given_name || kindeUser.family_name || email?.split('@')[0] || 'User';

  if (!email) {
    throw new Error('Kinde user must have an email address');
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:34',message:'Starting user sync',data:{email,kindeId,pbAuthValid:pb.authStore?.isValid,pbIsAdmin:pb.authStore?.isAdmin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Try to find existing user by email
    let pbUser;
    try {
      pbUser = await pb.collection('users').getFirstListItem(`email = "${email}"`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:38',message:'Found existing user',data:{pbUserId:pbUser.id,email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // User exists - update if needed
      const updateData: any = {};
      let needsUpdate = false;

      // Update name if changed
      if (pbUser.name !== name) {
        updateData.name = name;
        needsUpdate = true;
      }

      // Update email_verified if changed
      if (pbUser.email_verified !== emailVerified) {
        updateData.email_verified = emailVerified;
        needsUpdate = true;
      }

      // Update kinde_id if not set or changed
      if (pbUser.kinde_id !== kindeId) {
        updateData.kinde_id = kindeId;
        needsUpdate = true;
      }

      // Only update if something changed
      if (needsUpdate) {
        console.log('[kinde-sync] Updating existing PocketBase user', {
          email,
          pbUserId: pbUser.id,
          updates: Object.keys(updateData)
        });
        
        pbUser = await pb.collection('users').update(pbUser.id, updateData);
      } else {
        console.log('[kinde-sync] PocketBase user already in sync', {
          email,
          pbUserId: pbUser.id
        });
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:77',message:'User lookup error',data:{email,errorStatus:err?.status,errorCode:err?.response?.code,errorMessage:err?.message,is404:err?.status===404||err?.response?.code===404},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // User not found - create new one
      if (err?.status === 404 || err?.response?.code === 404) {
        console.log('[kinde-sync] Creating new PocketBase user', { email, kindeId });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:82',message:'Creating new user',data:{email,name,role:'customer'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        pbUser = await pb.collection('users').create({
          email,
          emailVisibility: true,
          password: crypto.randomUUID(), // Generate random password (user won't use it - auth via Kinde)
          passwordConfirm: crypto.randomUUID(),
          name,
          role: 'customer', // Default role for new users
          email_verified: emailVerified,
          kinde_id: kindeId
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:93',message:'New user created',data:{pbUserId:pbUser.id,email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        console.log('[kinde-sync] Created new PocketBase user', {
          email,
          pbUserId: pbUser.id,
          kindeId
        });
      } else {
        // Unexpected error
        console.error('[kinde-sync] Error syncing user', {
          email,
          error: err?.message || err
        });
        throw err;
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:108',message:'User sync completed successfully',data:{pbUserId:pbUser.id,email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return pbUser;
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kinde-sync.ts:110',message:'User sync failed',data:{email,kindeId,errorType:err?.constructor?.name,errorMessage:err?.message,errorStatus:err?.status,errorCode:err?.response?.code,errorData:err?.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[kinde-sync] Failed to sync Kinde user to PocketBase', {
      email,
      kindeId,
      error: err?.message || err
    });
    throw err;
  }
}

