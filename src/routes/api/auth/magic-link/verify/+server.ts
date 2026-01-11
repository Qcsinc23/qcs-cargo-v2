import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyMagicLink } from '$lib/server/magic-link';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return json({ message: 'Token is required' }, { status: 400 });
    }

    // Verify the magic link token and get the auth result
    const result = await verifyMagicLink(token);

    if (!result.success || !result.token) {
      console.warn(`[verify] Magic link verification failed for token: ${token.substring(0, 8)}...`);
      return json(
        { message: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    console.log(`[verify] Successfully verified magic link for user: ${result.user.id}`);

    // Set the auth token in an httpOnly cookie
    cookies.set('pb_auth', result.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return json({
      message: 'Successfully authenticated',
      success: true
    });
  } catch (error: any) {
    console.error('[verify] Error verifying magic link:', error);

    const errorMessage = error.message || 'Failed to verify magic link';
    
    if (
      errorMessage.toLowerCase().includes('expired') || 
      errorMessage.toLowerCase().includes('invalid') ||
      errorMessage.toLowerCase().includes('not found')
    ) {
      return json(
        { message: 'Invalid or expired magic link. Please request a new one.' },
        { status: 401 }
      );
    }

    return json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
};
