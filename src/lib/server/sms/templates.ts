import { sendSMS } from './index';
import { PUBLIC_SITE_URL, PUBLIC_COMPANY_NAME } from '$env/static/public';
import type { SMSResult } from './index';

// Template configuration
const SMS_TEMPLATES = {
  max_length: 160, // Standard SMS length
  truncate_suffix: '...'
};

/**
 * Truncate text to fit SMS length limit
 */
function truncateText(text: string, maxLength: number = SMS_TEMPLATES.max_length): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - SMS_TEMPLATES.truncate_suffix.length) + SMS_TEMPLATES.truncate_suffix;
}

/**
 * Format tracking URL for SMS
 */
function formatTrackingUrl(trackingNumber: string): string {
  const baseUrl = PUBLIC_SITE_URL.replace(/\/$/, '');
  return `${baseUrl}/track/${trackingNumber}`;
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  phoneNumber: string,
  data: {
    customerName: string;
    bookingId: string;
    destination: string;
    scheduledDate: string;
    total: number;
    trackingNumbers?: string[];
  }
): Promise<SMSResult> {
  const { customerName, bookingId, destination, scheduledDate, total, trackingNumbers } = data;

  let message = `QCS: ${customerName}, your booking #${bookingId} to ${destination} is confirmed for ${scheduledDate}. Total: $${total.toFixed(2)}. `;

  if (trackingNumbers && trackingNumbers.length > 0) {
    const trackingList = trackingNumbers.map(tn => `#${tn}`).join(', ');
    message += `Tracking: ${trackingList}. `;
  }

  message += `Track: ${formatTrackingUrl(trackingNumbers?.[0] || bookingId)}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'booking_confirmation',
      booking_id: bookingId,
      customer_name: customerName
    }
  });
}

/**
 * Send shipment status update SMS
 */
export async function sendShipmentStatusSMS(
  phoneNumber: string,
  data: {
    trackingNumber: string;
    status: 'received' | 'processing' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered' | 'exception';
    statusDescription: string;
    location?: string;
    estimatedDelivery?: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumber, status, statusDescription, location, estimatedDelivery, customerName } = data;

  // Status emojis for better readability
  const statusEmojis = {
    received: '📦',
    processing: '⚙️',
    in_transit: '✈️',
    customs: '🛃',
    out_for_delivery: '🚚',
    delivered: '✅',
    exception: '⚠️'
  };

  const emoji = statusEmojis[status] || '📦';
  const greeting = customerName ? `${customerName}, ` : '';

  let message = `${emoji} QCS: ${greeting}shipment #${trackingNumber} ${statusDescription.toLowerCase()}.`;

  if (location) {
    message += ` Location: ${location}.`;
  }

  if (estimatedDelivery && status !== 'delivered') {
    message += ` ETA: ${estimatedDelivery}.`;
  }

  message += ` Track: ${formatTrackingUrl(trackingNumber)}`;

  // For delivered status, add delivery confirmation
  if (status === 'delivered') {
    message += ` Reply DONE to confirm delivery.`;
  }

  // For exception status, add contact info
  if (status === 'exception') {
    message += ` Call 201-249-0929 for assistance.`;
  }

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'shipment_status',
      tracking_number: trackingNumber,
      status,
      location,
      estimated_delivery: estimatedDelivery
    }
  });
}

/**
 * Send out for delivery notification SMS
 */
export async function sendOutForDeliverySMS(
  phoneNumber: string,
  data: {
    trackingNumber: string;
    recipientName?: string;
    deliveryAddress?: string;
    deliveryWindow?: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumber, recipientName, deliveryAddress, deliveryWindow, customerName } = data;

  const greeting = customerName || recipientName ? `${customerName || recipientName}, ` : '';
  let message = `🚚 QCS: ${greeting}your package #${trackingNumber} is out for delivery!`;

  if (deliveryWindow) {
    message += ` Expected: ${deliveryWindow}.`;
  }

  if (deliveryAddress) {
    message += ` Address: ${deliveryAddress}.`;
  }

  message += ` Track live: ${formatTrackingUrl(trackingNumber)}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'out_for_delivery',
      tracking_number: trackingNumber,
      delivery_window: deliveryWindow
    }
  });
}

/**
 * Send delivered confirmation SMS
 */
export async function sendDeliveredSMS(
  phoneNumber: string,
  data: {
    trackingNumber: string;
    deliveredTime?: string;
    recipientName?: string;
    signatureRequired?: boolean;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumber, deliveredTime, recipientName, signatureRequired, customerName } = data;

  const greeting = customerName || recipientName ? `${customerName || recipientName}, ` : '';
  let message = `✅ QCS: ${greeting}your package #${trackingNumber} has been delivered!`;

  if (deliveredTime) {
    message += ` Delivered at: ${deliveredTime}.`;
  }

  if (signatureRequired) {
    message += ` Signature received.`;
  }

  message += ` View details: ${formatTrackingUrl(trackingNumber)}`;

  // Add review request
  message += ` Rate your experience: ${PUBLIC_SITE_URL}/review/${trackingNumber}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'delivered',
      tracking_number: trackingNumber,
      delivered_time: deliveredTime,
      signature_required: signatureRequired
    }
  });
}

/**
 * Send exception/alert SMS
 */
export async function sendExceptionSMS(
  phoneNumber: string,
  data: {
    trackingNumber: string;
    exceptionType: 'delay' | 'address_issue' | 'customs_hold' | 'damaged' | 'lost' | 'other';
    exceptionDescription: string;
    actionRequired?: boolean;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumber, exceptionType, exceptionDescription, actionRequired, customerName } = data;

  const greeting = customerName ? `${customerName}, ` : '';
  const urgent = actionRequired ? 'URGENT: ' : '';

  let message = `⚠️ ${urgent}QCS: ${greeting}issue with shipment #${trackingNumber}. ${exceptionDescription}`;

  if (actionRequired) {
    message += ` Please call 201-249-0929 immediately.`;
  } else {
    message += ` We're working to resolve it.`;
  }

  message += ` Track: ${formatTrackingUrl(trackingNumber)}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'exception',
      tracking_number: trackingNumber,
      exception_type: exceptionType,
      action_required: actionRequired
    }
  });
}

/**
 * Send ETA update SMS
 */
export async function sendETAUpdateSMS(
  phoneNumber: string,
  data: {
    trackingNumber: string;
    newETA: string;
    reason?: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumber, newETA, reason, customerName } = data;

  const greeting = customerName ? `${customerName}, ` : '';
  let message = `QCS: ${greeting}ETA updated for #${trackingNumber}. New delivery: ${newETA}.`;

  if (reason) {
    message += ` Reason: ${reason}.`;
  }

  message += ` Track: ${formatTrackingUrl(trackingNumber)}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'eta_update',
      tracking_number: trackingNumber,
      new_eta: newETA,
      reason
    }
  });
}

/**
 * Send phone verification SMS
 */
export async function sendPhoneVerificationSMS(
  phoneNumber: string,
  data: {
    verificationCode: string;
    customerName?: string;
    expiryMinutes?: number;
  }
): Promise<SMSResult> {
  const { verificationCode, customerName, expiryMinutes = 10 } = data;

  const greeting = customerName ? `${customerName}, ` : '';
  const message = `${PUBLIC_COMPANY_NAME}: ${greeting}your verification code is ${verificationCode}. Expires in ${expiryMinutes} minutes. Do not share this code.`;

  return sendSMS({
    to: phoneNumber,
    body: message,
    metadata: {
      type: 'phone_verification',
      verification_code_hash: verificationCode.substring(0, 4) + '****',
      expiry_minutes: expiryMinutes
    }
  });
}

/**
 * Send payment confirmation SMS
 */
export async function sendPaymentConfirmationSMS(
  phoneNumber: string,
  data: {
    bookingId: string;
    amount: number;
    paymentMethod: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { bookingId, amount, paymentMethod, customerName } = data;

  const greeting = customerName ? `${customerName}, ` : '';
  const message = `QCS: ${greeting}payment of $${amount.toFixed(2)} confirmed for booking #${bookingId} via ${paymentMethod}. Your shipment is now being processed.`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'payment_confirmation',
      booking_id: bookingId,
      amount,
      payment_method: paymentMethod
    }
  });
}

/**
 * Send promotional/marketing SMS (only with explicit consent)
 */
export async function sendPromotionalSMS(
  phoneNumber: string,
  data: {
    offer: string;
    promoCode?: string;
    expiryDate?: string;
    link?: string;
  }
): Promise<SMSResult> {
  const { offer, promoCode, expiryDate, link } = data;

  let message = `🎉 QCS Special Offer: ${offer}`;

  if (promoCode) {
    message += ` Use code: ${promoCode}`;
  }

  if (expiryDate) {
    message += `. Expires ${expiryDate}`;
  }

  if (link) {
    message += `. ${link}`;
  } else {
    message += `. Visit ${PUBLIC_SITE_URL}`;
  }

  message += ` Reply STOP to unsubscribe`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'promotional',
      promo_code: promoCode,
      expiry_date: expiryDate
    }
  });
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSMS(
  phoneNumber: string,
  data: {
    appointmentType: 'drop_off' | 'pickup';
    bookingId: string;
    dateTime: string;
    location?: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { appointmentType, bookingId, dateTime, location, customerName } = data;

  const action = appointmentType === 'drop_off' ? 'drop off' : 'pick up';
  const greeting = customerName ? `${customerName}, ` : '';

  let message = `QCS: ${greeting}reminder to ${action} your packages for booking #${bookingId} on ${dateTime}.`;

  if (location) {
    message += ` Location: ${location}.`;
  }

  message += ` Need to reschedule? Call 201-249-0929`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'appointment_reminder',
      appointment_type: appointmentType,
      booking_id: bookingId
    }
  });
}

/**
 * Send weather delay notification SMS
 */
export async function sendWeatherDelaySMS(
  phoneNumber: string,
  data: {
    trackingNumbers: string[];
    delayReason: string;
    newETA?: string;
    customerName?: string;
  }
): Promise<SMSResult> {
  const { trackingNumbers, delayReason, newETA, customerName } = data;

  const greeting = customerName ? `${customerName}, ` : '';
  const trackingList = trackingNumbers.map(tn => `#${tn}`).join(', ');

  let message = `🌧️ QCS: ${greeting}weather delay affecting shipments ${trackingList}. ${delayReason}`;

  if (newETA) {
    message += ` New ETA: ${newETA}.`;
  }

  message += ` Track updates: ${formatTrackingUrl(trackingNumbers[0])}`;

  return sendSMS({
    to: phoneNumber,
    body: truncateText(message),
    metadata: {
      type: 'weather_delay',
      tracking_numbers: trackingNumbers,
      delay_reason: delayReason,
      new_eta: newETA
    }
  });
}