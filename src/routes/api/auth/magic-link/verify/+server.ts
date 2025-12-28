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
      return json(
        { message: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

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
    console.error('Error verifying magic link:', error);

    if (error.message?.includes('expired') || error.message?.includes('invalid')) {
      return json(
        { message: error.message },
        { status: 401 }
      );
    }

    return json(
      { message: 'Failed to verify magic link. Please try again.' },
      { status: 500 }
    );
  }
};
