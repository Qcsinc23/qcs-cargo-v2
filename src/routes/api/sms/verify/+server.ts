import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/index';
import { verifyPhoneCode } from '$lib/server/notifications';
import { z } from 'zod';

const requestSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 characters')
});

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      throw error(401, 'Unauthorized');
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Verify the code
    const result = await verifyPhoneCode(locals.user.id, validatedData.code);

    if (result.success) {
      // Get updated user data
      const user = await pb.collection('users').getOne(locals.user.id);

      return json({
        success: true,
        message: 'Phone number verified successfully',
        phone: user.phone,
        phoneVerified: user.phone_verified
      });
    } else {
      return json({
        success: false,
        error: result.error || 'Failed to verify phone number'
      }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return json({
        success: false,
        error: 'Invalid verification code',
        details: err.errors
      }, { status: 400 });
    }

    console.error('[SMS Verify Error]', err);
    return json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
};