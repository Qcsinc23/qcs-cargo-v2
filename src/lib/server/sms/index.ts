import { createHash } from 'crypto';

/** Twilio error shape (code/message) */
interface TwilioError {
  code?: number;
  message?: string;
}

// Check if SMS is configured (lazy evaluation)
function isSMSConfigured() {
  try {
    // Try to access environment variables
    const envPrivate = process.env;
    const envPublic = process.env;

    return !!(
      envPrivate.TWILIO_ACCOUNT_SID &&
      envPrivate.TWILIO_AUTH_TOKEN &&
      envPrivate.TWILIO_PHONE_NUMBER &&
      envPublic.PUBLIC_COMPANY_NAME
    );
  } catch {
    return false;
  }
}

// Twilio client variable
let twilioClient: any = null;

// Lazy initialization function for Twilio client
async function getTwilioClient() {
  if (!isSMSConfigured()) return null;
  if (!twilioClient) {
    try {
      // Dynamic import for ESM compatibility
      const { Twilio } = await import('twilio');
      twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );
    } catch (error) {
      console.warn('[SMS] Failed to initialize Twilio:', error);
      return null;
    }
  }
  return twilioClient;
}

// Rate limiting using in-memory storage
// TODO: For production, implement Redis or PocketBase-backed rate limiting
// Current in-memory approach has limitations:
// - Lost on server restart
// - Not shared across multiple server instances
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 SMS per minute per number

interface SMSSendOptions {
  to: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface SMSResult {
  success: boolean;
  sid?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Check if a phone number is rate limited
 */
function isRateLimited(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber);
  const now = Date.now();
  const limit = rateLimitMap.get(normalized);

  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(normalized, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return false;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  limit.count++;
  return false;
}

/**
 * Normalize phone number for consistent rate limiting
 */
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If starts with country code, use as is, otherwise assume US
  if (digits.length === 10) {
    return `1${digits}`;
  }

  return digits;
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber);
  // Check if it's a valid US/Canada number (10 or 11 digits starting with 1)
  return /^1?\d{10}$/.test(normalized);
}

/**
 * Generate a unique ID for tracking
 */
function generateTrackingId(): string {
  return createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex')
    .substring(0, 16);
}

/**
 * Send an SMS message
 */
export async function sendSMS(options: SMSSendOptions): Promise<SMSResult> {
  const { to, body, metadata = {} } = options;

  // Check if SMS is configured
  if (!isSMSConfigured()) {
    return {
      success: false,
      error: 'SMS service is not configured',
      metadata: { ...metadata, error_code: 'SMS_NOT_CONFIGURED' }
    };
  }

  try {
    // Validate phone number
    if (!validatePhoneNumber(to)) {
      return {
        success: false,
        error: 'Invalid phone number format. Please use a valid US/Canada phone number.',
        metadata: { ...metadata, error_code: 'INVALID_PHONE' }
      };
    }

    // Check rate limiting
    if (isRateLimited(to)) {
      return {
        success: false,
        error: 'Too many messages sent. Please try again later.',
        metadata: { ...metadata, error_code: 'RATE_LIMITED' }
      };
    }

    const finalBody = `${body}\n\n- ${process.env.PUBLIC_COMPANY_NAME}`;

    // Check message length (Twilio limit is 1600 characters for single SMS)
    if (finalBody.length > 1600) {
      return {
        success: false,
        error: 'Message too long. Maximum 1600 characters allowed.',
        metadata: { ...metadata, error_code: 'MESSAGE_TOO_LONG' }
      };
    }

    // Add tracking metadata
    const trackingId = generateTrackingId();
    const enhancedMetadata = {
      ...metadata,
      tracking_id: trackingId,
      timestamp: new Date().toISOString(),
      message_length: body.length
    };

    // Get Twilio client
    const client = await getTwilioClient();
    if (!client) {
      return {
        success: false,
        error: 'Failed to initialize SMS service',
        metadata: { ...metadata, error_code: 'SMS_INIT_FAILED' }
      };
    }

    // Send SMS through Twilio
    const message = await client.messages.create({
      body: finalBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumberForTwilio(to),
      statusCallback: `${process.env.PUBLIC_SITE_URL}/api/webhooks/sms/status`,
    });

    console.log(`[SMS Sent] To: ${to} SID: ${message.sid} Tracking: ${trackingId}`);

    return {
      success: true,
      sid: message.sid,
      metadata: enhancedMetadata
    };

  } catch (error) {
    console.error('[SMS Error]', error);

    // Handle specific Twilio errors
    if (error && typeof error === 'object' && 'code' in error) {
      const twilioError = error as TwilioError;

      switch (twilioError.code) {
        case 21211:
          return {
            success: false,
            error: 'Invalid "To" phone number',
            metadata: { ...metadata, error_code: 'INVALID_TO_PHONE', twilio_code: twilioError.code }
          };
        case 21212:
          return {
            success: false,
            error: 'Invalid "From" phone number',
            metadata: { ...metadata, error_code: 'INVALID_FROM_PHONE', twilio_code: twilioError.code }
          };
        case 21614:
          return {
            success: false,
            error: 'The "To" phone number is not currently reachable',
            metadata: { ...metadata, error_code: 'PHONE_UNREACHABLE', twilio_code: twilioError.code }
          };
        case 21612:
          return {
            success: false,
            error: 'The message body is empty',
            metadata: { ...metadata, error_code: 'EMPTY_BODY', twilio_code: twilioError.code }
          };
        default:
          return {
            success: false,
            error: 'Failed to send SMS. Please try again.',
            metadata: { ...metadata, error_code: 'TWILIO_ERROR', twilio_code: twilioError.code }
          };
      }
    }

    return {
      success: false,
      error: 'Failed to send SMS. Please try again later.',
      metadata: { ...metadata, error_code: 'UNKNOWN_ERROR' }
    };
  }
}

/**
 * Format phone number for Twilio API
 */
function formatPhoneNumberForTwilio(phoneNumber: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);

  // Format as +1XXX... for Twilio
  if (normalized.length === 10) {
    return `+1${normalized}`;
  } else if (normalized.length === 11 && normalized.startsWith('1')) {
    return `+${normalized}`;
  }

  // Return original if can't normalize
  return phoneNumber;
}

/**
 * Check if SMS delivery was successful
 */
export async function checkSMSStatus(sid: string): Promise<{
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  error?: string;
}> {
  try {
    const client = await getTwilioClient();
    if (!client) {
      return {
        status: 'failed',
        error: 'SMS service not initialized'
      };
    }
    
    const message = await client.messages(sid).fetch();

    return {
      status: message.status as any,
      error: message.errorMessage || undefined
    };
  } catch (error) {
    console.error('[SMS Status Check Error]', error);
    return {
      status: 'failed',
      error: 'Unable to retrieve message status'
    };
  }
}

/**
 * Get SMS usage statistics
 */
export function getSMSUsageStats(): {
  totalRequests: number;
  rateLimitedNumbers: number;
  windowResetTime: number;
} {
  const now = Date.now();
  let totalRequests = 0;
  let rateLimitedNumbers = 0;
  let windowResetTime = now + RATE_LIMIT_WINDOW;

  rateLimitMap.forEach((limit) => {
    totalRequests += limit.count;
    if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
      rateLimitedNumbers++;
    }
    windowResetTime = Math.min(windowResetTime, limit.resetTime);
  });

  return {
    totalRequests,
    rateLimitedNumbers,
    windowResetTime
  };
}

/**
 * Clear rate limit for a specific phone number (admin function)
 */
export function clearRateLimit(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber);
  return rateLimitMap.delete(normalized);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Stub implementations for specific SMS functions used by notifications
export async function sendBookingConfirmationSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Booking confirmation: ${options?.bookingId || 'N/A'} for ${options?.customerName || 'Customer'}`,
    metadata: { category: 'booking', type: 'confirmation' }
  });
}

export async function sendShipmentStatusSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Shipment ${options?.trackingNumber || ''} status: ${options?.status || 'Unknown'}`,
    metadata: { category: 'shipment', type: 'status_update' }
  });
}

export async function sendOutForDeliverySMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Your shipment ${options?.trackingNumber || ''} is out for delivery!`,
    metadata: { category: 'shipment', type: 'out_for_delivery' }
  });
}

export async function sendDeliveredSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Your shipment ${options?.trackingNumber || ''} has been delivered!`,
    metadata: { category: 'shipment', type: 'delivered' }
  });
}

export async function sendPaymentConfirmationSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Payment confirmed for booking ${options?.bookingId || 'N/A'}. Amount: $${options?.amount || '0.00'}`,
    metadata: { category: 'payment', type: 'confirmation' }
  });
}

export async function sendAppointmentReminderSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Reminder: Your appointment is scheduled for ${options?.date || 'TBD'} at ${options?.time || 'TBD'}`,
    metadata: { category: 'appointment', type: 'reminder' }
  });
}

export async function sendPhoneVerificationSMS(phone: string, options: any): Promise<SMSResult> {
  const code = options?.verificationCode ?? options?.verification_code ?? options?.code;
  return sendSMS({
    to: phone,
    body: `Your verification code is: ${code || '000000'}`,
    metadata: { category: 'verification', type: 'phone_verify' }
  });
}

export async function sendExceptionSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `Exception update for shipment ${options?.trackingNumber || ''}: ${options?.message || 'No details available'}`,
    metadata: { category: 'shipment', type: 'exception' }
  });
}

export async function sendETAUpdateSMS(phone: string, options: any): Promise<SMSResult> {
  return sendSMS({
    to: phone,
    body: `ETA update for shipment ${options?.trackingNumber || ''}: ${options?.eta || 'Unknown'}`,
    metadata: { category: 'shipment', type: 'eta_update' }
  });
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  // Run on server only
  if (typeof process !== 'undefined' && typeof window === 'undefined') {
    setInterval(cleanupRateLimits, 5 * 60 * 1000);
  }
}
