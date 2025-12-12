import { pb } from '$lib/server/index';
import { sendEmail, sendBookingConfirmationEmail, sendStatusUpdateEmail } from '$lib/server/email';
import {
  sendSMS,
  sendBookingConfirmationSMS,
  sendShipmentStatusSMS,
  sendOutForDeliverySMS,
  sendDeliveredSMS,
  sendExceptionSMS,
  sendETAUpdateSMS,
  sendPhoneVerificationSMS,
  sendPaymentConfirmationSMS,
  sendAppointmentReminderSMS
} from '$lib/server/sms';
import type { SMSResult } from '$lib/server/sms';

// Default notification preferences for users
const DEFAULT_NOTIFICATION_PREFERENCES = {
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

export type NotificationType = 'email' | 'sms' | 'both';
export type NotificationCategory = 'booking' | 'shipment' | 'payment' | 'marketing' | 'verification' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationOptions {
  userId?: string;
  email?: string;
  phone?: string;
  type?: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  skipPreferences?: boolean; // For critical notifications
  metadata?: Record<string, any>;
  bookingId?: string;
  shipmentId?: string;
}

export interface NotificationResult {
  email?: { success: boolean; id?: string; error?: string };
  sms?: { success: boolean; sid?: string; error?: string };
  overall: boolean;
}

/**
 * Get user notification preferences
 */
async function getUserNotificationPreferences(userId: string) {
  try {
    const user = await pb.collection('users').getOne(userId);

    // Return merged preferences with defaults
    const preferences = user.sms_notifications || DEFAULT_NOTIFICATION_PREFERENCES;

    return {
      email: preferences.email || DEFAULT_NOTIFICATION_PREFERENCES.email,
      sms: preferences.sms || DEFAULT_NOTIFICATION_PREFERENCES.sms,
      phone: user.phone,
      phoneVerified: user.phone_verified,
      smsEnabled: user.sms_enabled,
      email: user.email,
      emailVerified: user.email_verified
    };
  } catch (error) {
    console.error('[Notification Error] Failed to get user preferences:', error);
    return {
      email: DEFAULT_NOTIFICATION_PREFERENCES.email,
      sms: DEFAULT_NOTIFICATION_PREFERENCES.sms,
      phone: null,
      phoneVerified: false,
      smsEnabled: false,
      email: null,
      emailVerified: false
    };
  }
}

/**
 * Log notification to database
 */
async function logNotification(data: {
  userId?: string;
  type: 'email' | 'sms';
  category: NotificationCategory;
  recipient: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  providerId?: string;
  provider?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  bookingId?: string;
  shipmentId?: string;
}) {
  try {
    const logData = {
      user: data.userId || null,
      type: data.type,
      category: data.category,
      recipient: data.recipient,
      subject: data.subject || null,
      content: data.content,
      status: data.status,
      provider_id: data.providerId || null,
      provider: data.provider || null,
      error_message: data.errorMessage || null,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
      delivered_at: data.status === 'delivered' ? new Date().toISOString() : null,
      metadata: data.metadata || null,
      booking: data.bookingId || null,
      shipment: data.shipmentId || null
    };

    await pb.collection('notification_logs').create(logData);
  } catch (error) {
    console.error('[Notification Error] Failed to log notification:', error);
    // Don't throw - logging failure shouldn't break the notification flow
  }
}

/**
 * Send unified notification (email and/or SMS)
 */
export async function sendNotification(
  options: NotificationOptions & {
    subject: string;
    emailHtml?: string;
    emailText?: string;
    smsBody?: string;
  }
): Promise<NotificationResult> {
  const {
    userId,
    email,
    phone,
    type = 'both',
    category,
    priority = 'normal',
    skipPreferences = false,
    subject,
    emailHtml,
    emailText,
    smsBody,
    metadata = {},
    bookingId,
    shipmentId
  } = options;

  const result: NotificationResult = { overall: true };
  let userPreferences = null;

  // Get user preferences if userId provided
  if (userId && !skipPreferences) {
    userPreferences = await getUserNotificationPreferences(userId);
  }

  // Determine recipients
  const emailRecipient = email || (userPreferences?.email || null);
  const smsRecipient = phone || (userPreferences?.phone || null);

  // Check if notification should be sent via email
  const shouldSendEmail =
    type === 'email' ||
    type === 'both' ||
    (type === 'both' && userPreferences?.email?.[category]);

  // Check if notification should be sent via SMS
  const shouldSendSMS =
    type === 'sms' ||
    type === 'both' ||
    (type === 'both' &&
     userPreferences?.smsEnabled &&
     userPreferences?.phoneVerified &&
     userPreferences?.sms?.[category]);

  // Send email notification
  if (shouldSendEmail && emailRecipient && emailHtml) {
    try {
      const emailResult = await sendEmail({
        to: emailRecipient,
        subject,
        html: emailHtml,
        text: emailText
      });

      result.email = { success: true, id: emailResult.id };
      await logNotification({
        userId,
        type: 'email',
        category,
        recipient: emailRecipient,
        subject,
        content: emailText || emailHtml,
        status: 'sent',
        providerId: emailResult.id,
        provider: 'resend',
        metadata,
        bookingId,
        shipmentId
      });

    } catch (error) {
      console.error('[Notification Error] Email failed:', error);
      result.email = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      result.overall = false;

      await logNotification({
        userId,
        type: 'email',
        category,
        recipient: emailRecipient,
        subject,
        content: emailText || emailHtml,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        provider: 'resend',
        metadata,
        bookingId,
        shipmentId
      });
    }
  }

  // Send SMS notification
  if (shouldSendSMS && smsRecipient && smsBody) {
    try {
      const smsResult: SMSResult = await sendSMS({
        to: smsRecipient,
        body: smsBody,
        metadata: { category, priority, ...metadata }
      });

      result.sms = {
        success: smsResult.success,
        sid: smsResult.sid,
        error: smsResult.error
      };

      if (!smsResult.success) {
        result.overall = false;
      }

      await logNotification({
        userId,
        type: 'sms',
        category,
        recipient: smsRecipient,
        content: smsBody,
        status: smsResult.success ? 'sent' : 'failed',
        providerId: smsResult.sid,
        provider: 'twilio',
        errorMessage: smsResult.error,
        metadata: { ...metadata, ...smsResult.metadata },
        bookingId,
        shipmentId
      });

    } catch (error) {
      console.error('[Notification Error] SMS failed:', error);
      result.sms = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      result.overall = false;

      await logNotification({
        userId,
        type: 'sms',
        category,
        recipient: smsRecipient,
        content: smsBody,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        provider: 'twilio',
        metadata,
        bookingId,
        shipmentId
      });
    }
  }

  return result;
}

/**
 * Send booking confirmation notifications
 */
export async function sendBookingConfirmation(
  userId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    bookingId: string;
    destination: string;
    scheduledDate: string;
    timeSlot: string;
    packageCount: number;
    total: number;
    trackingNumbers?: string[];
  }
): Promise<NotificationResult> {
  const { name, email, phone, bookingId, destination, scheduledDate, timeSlot, packageCount, total, trackingNumbers } = data;

  // Send email
  const emailPromise = sendBookingConfirmationEmail(email || '', name, {
    id: bookingId,
    destination,
    scheduledDate,
    timeSlot,
    packageCount,
    total
  });

  // Send SMS
  const smsPromise = sendBookingConfirmationSMS(phone || '', {
    customerName: name,
    bookingId,
    destination,
    scheduledDate,
    total,
    trackingNumbers
  });

  // Wait for both to complete
  const [emailResult, smsResult] = await Promise.allSettled([emailPromise, smsPromise]);

  const result: NotificationResult = {
    overall: true
  };

  // Handle email result
  if (emailResult.status === 'fulfilled') {
    result.email = { success: true, id: emailResult.value.id };
  } else {
    result.email = {
      success: false,
      error: emailResult.reason instanceof Error ? emailResult.reason.message : 'Email failed'
    };
    result.overall = false;
  }

  // Handle SMS result
  if (smsResult.status === 'fulfilled') {
    result.sms = {
      success: smsResult.value.success,
      sid: smsResult.value.sid,
      error: smsResult.value.error
    };
    if (!smsResult.value.success) {
      result.overall = false;
    }
  } else {
    result.sms = {
      success: false,
      error: smsResult.reason instanceof Error ? smsResult.reason.message : 'SMS failed'
    };
    result.overall = false;
  }

  // Log both notifications
  await Promise.all([
    logNotification({
      userId,
      type: 'email',
      category: 'booking',
      recipient: email || '',
      subject: `Booking Confirmed - ${destination}`,
      content: `Booking #${bookingId} confirmed for ${scheduledDate}`,
      status: result.email?.success ? 'sent' : 'failed',
      providerId: result.email?.id,
      provider: 'resend',
      errorMessage: result.email?.error,
      bookingId
    }),
    logNotification({
      userId,
      type: 'sms',
      category: 'booking',
      recipient: phone || '',
      content: `Booking #${bookingId} confirmed for ${destination}`,
      status: result.sms?.success ? 'sent' : 'failed',
      providerId: result.sms?.sid,
      provider: 'twilio',
      errorMessage: result.sms?.error,
      bookingId
    })
  ]);

  return result;
}

/**
 * Send shipment status update notifications
 */
export async function sendShipmentStatusUpdate(
  userId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    trackingNumber: string;
    status: string;
    statusDescription: string;
    location?: string;
    estimatedDelivery?: string;
  }
): Promise<NotificationResult> {
  const { name, email, phone, trackingNumber, status, statusDescription, location, estimatedDelivery } = data;

  // Send email
  const emailPromise = sendStatusUpdateEmail(email || '', name, {
    trackingNumber,
    status,
    statusDescription,
    location
  });

  // Send SMS
  const smsPromise = sendShipmentStatusSMS(phone || '', {
    trackingNumber,
    status: status as any,
    statusDescription,
    location,
    estimatedDelivery,
    customerName: name
  });

  // Wait for both to complete
  const [emailResult, smsResult] = await Promise.allSettled([emailPromise, smsPromise]);

  const result: NotificationResult = {
    overall: true
  };

  // Handle email result
  if (emailResult.status === 'fulfilled') {
    result.email = { success: true, id: emailResult.value.id };
  } else {
    result.email = {
      success: false,
      error: emailResult.reason instanceof Error ? emailResult.reason.message : 'Email failed'
    };
    result.overall = false;
  }

  // Handle SMS result
  if (smsResult.status === 'fulfilled') {
    result.sms = {
      success: smsResult.value.success,
      sid: smsResult.value.sid,
      error: smsResult.value.error
    };
    if (!smsResult.value.success) {
      result.overall = false;
    }
  } else {
    result.sms = {
      success: false,
      error: smsResult.reason instanceof Error ? smsResult.reason.message : 'SMS failed'
    };
    result.overall = false;
  }

  return result;
}

/**
 * Send phone verification code
 */
export async function sendPhoneVerification(
  userId: string,
  phoneNumber: string,
  verificationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user details
    const user = await pb.collection('users').getOne(userId);

    // Send SMS with verification code
    const result = await sendPhoneVerificationSMS(phoneNumber, {
      verificationCode,
      customerName: user.name
    });

    if (result.success) {
      // Update user record with verification details
      await pb.collection('users').update(userId, {
        phone_verification_code: verificationCode,
        phone_verification_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

      // Log notification
      await logNotification({
        userId,
        type: 'sms',
        category: 'verification',
        recipient: phoneNumber,
        content: `Phone verification code sent`,
        status: 'sent',
        providerId: result.sid,
        provider: 'twilio',
        metadata: { verification_code_hash: verificationCode.substring(0, 4) + '****' }
      });

      return { success: true };
    } else {
      // Log failed attempt
      await logNotification({
        userId,
        type: 'sms',
        category: 'verification',
        recipient: phoneNumber,
        content: `Failed to send phone verification code`,
        status: 'failed',
        provider: 'twilio',
        errorMessage: result.error
      });

      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('[Notification Error] Phone verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Verify phone number with code
 */
export async function verifyPhoneCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user record
    const user = await pb.collection('users').getOne(userId);

    // Check if code matches and hasn't expired
    if (user.phone_verification_code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    if (!user.phone_verification_expires || new Date(user.phone_verification_expires) < new Date()) {
      return { success: false, error: 'Verification code has expired' };
    }

    // Mark phone as verified
    await pb.collection('users').update(userId, {
      phone_verified: true,
      phone_verification_code: null,
      phone_verification_expires: null
    });

    // Log successful verification
    await logNotification({
      userId,
      type: 'sms',
      category: 'verification',
      recipient: user.phone,
      content: `Phone number successfully verified`,
      status: 'delivered',
      provider: 'system'
    });

    return { success: true };
  } catch (error) {
    console.error('[Notification Error] Phone verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    email?: Partial<typeof DEFAULT_NOTIFICATION_PREFERENCES.email>;
    sms?: Partial<typeof DEFAULT_NOTIFICATION_PREFERENCES.sms>;
    smsEnabled?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current preferences
    const user = await pb.collection('users').getOne(userId);
    const currentPrefs = user.sms_notifications || DEFAULT_NOTIFICATION_PREFERENCES;

    // Merge with new preferences
    const updatedPrefs = {
      email: { ...currentPrefs.email, ...preferences.email },
      sms: { ...currentPrefs.sms, ...preferences.sms }
    };

    // Update user record
    await pb.collection('users').update(userId, {
      sms_notifications: updatedPrefs,
      sms_enabled: preferences.smsEnabled !== undefined ? preferences.smsEnabled : user.sms_enabled
    });

    return { success: true };
  } catch (error) {
    console.error('[Notification Error] Failed to update preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences'
    };
  }
}

/**
 * Get user notification history
 */
export async function getNotificationHistory(
  userId: string,
  options: {
    type?: 'email' | 'sms';
    category?: NotificationCategory;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ notifications: any[]; total: number }> {
  try {
    const { type, category, limit = 50, offset = 0 } = options;

    // Build filter
    let filter = `user = "${userId}"`;
    if (type) filter += ` && type = "${type}"`;
    if (category) filter += ` && category = "${category}"`;

    // Get notifications
    const notifications = await pb.collection('notification_logs').getList(offset, limit, {
      filter,
      sort: '-created',
      expand: 'booking,shipment'
    });

    return {
      notifications: notifications.items,
      total: notifications.totalItems
    };
  } catch (error) {
    console.error('[Notification Error] Failed to get notification history:', error);
    return { notifications: [], total: 0 };
  }
}