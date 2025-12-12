import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/index';
import { sendPhoneVerification } from '$lib/server/notifications';
import { z } from 'zod';

const requestSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits')
});

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      throw error(401, 'Unauthorized');
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Check if phone is already verified for this user
    const currentUser = await pb.collection('users').getOne(locals.user.id);
    if (currentUser.phone === validatedData.phone && currentUser.phone_verified) {
      return json({
        success: false,
        error: 'Phone number is already verified'
      }, { status: 400 });
    }

    // Check rate limiting (max 3 attempts per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentAttempts = await pb.collection('notification_logs').getList(1, 3, {
      filter: `user = "${locals.user.id}" && category = "verification" && type = "sms" && created >= "${oneHourAgo}"`
    });

    if (recentAttempts.totalItems >= 3) {
      return json({
        success: false,
        error: 'Too many verification attempts. Please try again later.'
      }, { status: 429 });
    }

    // Send verification SMS
    const result = await sendPhoneVerification(locals.user.id, validatedData.phone, Math.random().toString(36).substring(2, 8).toUpperCase());

    if (result.success) {
      // Update user's phone number (but don't mark as verified yet)
      await pb.collection('users').update(locals.user.id, {
        phone: validatedData.phone,
        phone_verified: false
      });

      return json({
        success: true,
        message: 'Verification code sent to your phone'
      });
    } else {
      return json({
        success: false,
        error: result.error || 'Failed to send verification code'
      }, { status: 500 });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return json({
        success: false,
        error: 'Invalid request data',
        details: err.errors
      }, { status: 400 });
    }

    console.error('[SMS Verification Error]', err);
    return json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
};