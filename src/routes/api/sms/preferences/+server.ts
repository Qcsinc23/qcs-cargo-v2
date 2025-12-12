import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/index';
import { updateNotificationPreferences } from '$lib/server/notifications';
import { z } from 'zod';

const preferencesSchema = z.object({
  email: z.object({
    booking: z.boolean().optional(),
    shipment: z.boolean().optional(),
    payment: z.boolean().optional(),
    marketing: z.boolean().optional(),
    verification: z.boolean().optional(),
    system: z.boolean().optional()
  }).optional(),
  sms: z.object({
    booking: z.boolean().optional(),
    shipment: z.boolean().optional(),
    payment: z.boolean().optional(),
    marketing: z.boolean().optional(),
    verification: z.boolean().optional(),
    system: z.boolean().optional()
  }).optional(),
  smsEnabled: z.boolean().optional()
});

// GET: Retrieve current notification preferences
export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      throw error(401, 'Unauthorized');
    }

    // Get user with preferences
    const user = await pb.collection('users').getOne(locals.user.id);

    // Default preferences if not set
    const defaultPrefs = {
      email: {
        booking: true,
        shipment: true,
        payment: true,
        marketing: false,
        verification: true,
        system: true
      },
      sms: {
        booking: true,
        shipment: true,
        payment: true,
        marketing: false,
        verification: true,
        system: false
      }
    };

    const preferences = user.sms_notifications || defaultPrefs;

    return json({
      success: true,
      data: {
        email: preferences.email,
        sms: preferences.sms,
        smsEnabled: user.sms_enabled || false,
        phone: user.phone,
        phoneVerified: user.phone_verified || false
      }
    });
  } catch (err) {
    console.error('[Notification Preferences GET Error]', err);
    return json({
      success: false,
      error: 'Failed to retrieve preferences'
    }, { status: 500 });
  }
};

// PUT: Update notification preferences
export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      throw error(401, 'Unauthorized');
    }

    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    // Update preferences
    const result = await updateNotificationPreferences(locals.user.id, validatedData);

    if (result.success) {
      // Get updated user data
      const user = await pb.collection('users').getOne(locals.user.id);

      return json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          email: user.sms_notifications?.email,
          sms: user.sms_notifications?.sms,
          smsEnabled: user.sms_enabled,
          phone: user.phone,
          phoneVerified: user.phone_verified
        }
      });
    } else {
      return json({
        success: false,
        error: result.error || 'Failed to update preferences'
      }, { status: 500 });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return json({
        success: false,
        error: 'Invalid preferences data',
        details: err.errors
      }, { status: 400 });
    }

    console.error('[Notification Preferences PUT Error]', err);
    return json({
      success: false,
      error: 'Failed to update preferences'
    }, { status: 500 });
  }
};