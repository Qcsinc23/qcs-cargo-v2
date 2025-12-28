import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // Clear the auth cookie
    cookies.delete('pb_auth', {
      path: '/'
    });

    return json({
      message: 'Successfully logged out',
      success: true
    });
  } catch (error: any) {
    console.error('Error logging out:', error);
    
    // Still try to clear the cookie even if there's an error
    cookies.delete('pb_auth', {
      path: '/'
    });

    return json(
      { message: 'Logged out', success: true },
      { status: 200 }
    );
  }
};
