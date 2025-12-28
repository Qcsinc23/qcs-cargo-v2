import { json, type RequestHandler } from '@sveltejs/kit';
import { requestMagicLink } from '$lib/server/magic-link';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return json({ message: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Request magic link (this will create/update user and send email)
    await requestMagicLink(email, name || '');

    return json({
      message: 'Magic link sent! Check your email to sign in.',
      success: true
    });
  } catch (error: any) {
    console.error('Error requesting magic link:', error);
    
    // Check for specific error messages
    if (error.message?.includes('email')) {
      return json({ message: error.message }, { status: 400 });
    }

    return json(
      { message: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
};
