import { json, type RequestHandler } from '@sveltejs/kit';
import { requestMagicLink } from '$lib/server/magic-link';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email: rawEmail, name, redirectTo } = await request.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!email) {
      return json({ message: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Request magic link (this will create/update user and send email)
    console.log(`[request] Requesting magic link for ${email}, redirectTo: ${redirectTo || 'none'}`);
    await requestMagicLink(email, name || '', redirectTo || '');

    return json({
      message: 'Magic link sent! Check your email to sign in.',
      success: true
    });
  } catch (error: any) {
    console.error('[request] Error requesting magic link:', error);
    
    // Check for specific error messages
    const errorMessage = error.message || '';
    if (errorMessage.toLowerCase().includes('email')) {
      return json({ message: errorMessage }, { status: 400 });
    }

    return json(
      { message: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
};
