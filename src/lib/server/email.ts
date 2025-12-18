import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { PUBLIC_COMPANY_NAME, PUBLIC_SITE_URL } from '$env/static/public';

// Helper to get env var or fallback
function getEnvVar(name: string, fallback?: string): string {
  const value = env[name] || fallback;
  if (!value) {
    console.warn(`[email] Missing environment variable: ${name}`);
    return '';
  }
  return value;
}

// Get env vars with fallbacks
const RESEND_API_KEY = getEnvVar('RESEND_API_KEY');
// RESEND_FROM_EMAIL may be either a plain email (noreply@...) or a full mailbox string (Name <noreply@...>).
// Prefer RESEND_FROM_EMAIL if present (it matches Resend's expected "from" format); otherwise build from FROM_EMAIL.
const RESEND_FROM_EMAIL = getEnvVar('RESEND_FROM_EMAIL');
const FROM_EMAIL = getEnvVar('FROM_EMAIL', 'noreply@qcs-cargo.com');
const REPLY_TO_EMAIL = getEnvVar('REPLY_TO_EMAIL', getEnvVar('ADMIN_EMAIL', 'support@qcs-cargo.com'));
const FROM_ADDRESS = RESEND_FROM_EMAIL || `${PUBLIC_COMPANY_NAME} <${FROM_EMAIL}>`;

// Create Resend instance (lazy initialization)
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for sending emails');
    }
    resendInstance = new Resend(RESEND_API_KEY);
  }
  return resendInstance;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, replyTo } = options;
  
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || REPLY_TO_EMAIL,
      subject,
      html,
      text
    });

    if (error) {
      console.error('[Email Error]', error);
      throw new Error(error.message);
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[Email Error]', error);
    throw error;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Contact Form Email
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  correlationId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const { name, email, phone, subject, message, correlationId, ip, userAgent } = data;

  const safeSubject = subject?.trim() ? subject.trim() : 'Contact form message';

  const html = wrapTemplate(`
    <h1>New Contact Form Message</h1>
    <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
    ${correlationId ? `<p><strong>Correlation ID:</strong> ${escapeHtml(correlationId)}</p>` : ''}
    ${ip ? `<p><strong>IP:</strong> ${escapeHtml(ip)}</p>` : ''}
    ${userAgent ? `<p><strong>User Agent:</strong> ${escapeHtml(userAgent)}</p>` : ''}

    <div class="info-box">
      <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
    </div>
  `);

  return sendEmail({
    to: REPLY_TO_EMAIL,
    subject: `[QCS Cargo] ${safeSubject}`,
    html,
    replyTo: email
  });
}

// Email Templates
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af; }
  .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
  .content { padding: 30px 0; }
  .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
  .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  .info-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; }
`;

function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📦 ${PUBLIC_COMPANY_NAME}</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>${PUBLIC_COMPANY_NAME} - Trusted Air Freight to the Caribbean</p>
          <p>35 Obrien St, E12, Kearny, NJ 07032 | 201-249-0929</p>
          <p><a href="${PUBLIC_SITE_URL}">Visit our website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Welcome Email
export async function sendWelcomeEmail(to: string, name: string) {
  const html = wrapTemplate(`
    <h1>Welcome to ${PUBLIC_COMPANY_NAME}, ${name}! 🎉</h1>
    <p>Thank you for creating an account with us. We're excited to help you ship to the Caribbean!</p>
    
    <div class="info-box">
      <h3>What you can do now:</h3>
      <ul>
        <li>📊 Get instant shipping quotes</li>
        <li>📦 Book shipments with easy scheduling</li>
        <li>🔍 Track your packages in real-time</li>
        <li>📫 Get your own mailbox address</li>
      </ul>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/dashboard" class="button">Go to Dashboard</a>
    </p>
    
    <p>If you have any questions, our team is here to help. Simply reply to this email or call us at 201-249-0929.</p>
    
    <p>Welcome aboard!<br>The ${PUBLIC_COMPANY_NAME} Team</p>
  `);

  return sendEmail({
    to,
    subject: `Welcome to ${PUBLIC_COMPANY_NAME}! 🎉`,
    html
  });
}

// Verification Email
export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  const html = wrapTemplate(`
    <h1>Verify Your Email Address</h1>
    <p>Hi ${name},</p>
    <p>Please click the button below to verify your email address:</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button">Verify Email</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
    
    <p>This link will expire in 24 hours.</p>
    
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `);

  return sendEmail({
    to,
    subject: `Verify your email - ${PUBLIC_COMPANY_NAME}`,
    html
  });
}

// Password Reset Email
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const html = wrapTemplate(`
    <h1>Reset Your Password</h1>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
    
    <p>This link will expire in 1 hour.</p>
    
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `);

  return sendEmail({
    to,
    subject: `Reset your password - ${PUBLIC_COMPANY_NAME}`,
    html
  });
}

// Booking Confirmation Email
export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  booking: {
    id: string;
    destination: string;
    scheduledDate: string;
    timeSlot: string;
    packageCount: number;
    total: number;
  }
) {
  const html = wrapTemplate(`
    <h1>Booking Confirmed! ✅</h1>
    <p>Hi ${name},</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Booking ID:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Destination:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Drop-off Date:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.scheduledDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Time Slot:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.timeSlot}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Packages:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.packageCount}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 12px 0 0; font-weight: 600;">Total:</td>
          <td style="padding: 12px 0 0; text-align: right; font-weight: 600; font-size: 18px; color: #1e40af;">$${booking.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    <h3>📍 Drop-off Location</h3>
    <p>
      QCS Cargo<br>
      35 Obrien St, E12<br>
      Kearny, NJ 07032
    </p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/dashboard/bookings/${booking.id}" class="button">View Booking Details</a>
    </p>
    
    <p><strong>Important:</strong> Please bring all packages during your scheduled time slot. Late arrivals may need to reschedule.</p>
  `);

  return sendEmail({
    to,
    subject: `Booking Confirmed - ${booking.destination} | ${PUBLIC_COMPANY_NAME}`,
    html
  });
}

// Shipment Status Update Email
export async function sendStatusUpdateEmail(
  to: string,
  name: string,
  shipment: {
    trackingNumber: string;
    status: string;
    statusDescription: string;
    location?: string;
  }
) {
  const statusEmoji: Record<string, string> = {
    received: '📦',
    processing: '⚙️',
    in_transit: '✈️',
    customs: '🛃',
    out_for_delivery: '🚚',
    delivered: '✅',
    exception: '⚠️'
  };

  const emoji = statusEmoji[shipment.status] || '📦';

  const html = wrapTemplate(`
    <h1>${emoji} Shipment Update</h1>
    <p>Hi ${name},</p>
    <p>Your shipment status has been updated:</p>
    
    <div class="info-box">
      <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
      <p><strong>Status:</strong> ${shipment.statusDescription}</p>
      ${shipment.location ? `<p><strong>Location:</strong> ${shipment.location}</p>` : ''}
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/tracking/${shipment.trackingNumber}" class="button">Track Shipment</a>
    </p>
  `);

  return sendEmail({
    to,
    subject: `${emoji} ${shipment.statusDescription} - ${shipment.trackingNumber}`,
    html
  });
}

// Account Deletion Email
export async function sendAccountDeletionEmail(to: string, name: string) {
  const html = wrapTemplate(`
    <h1>Account Scheduled for Deletion</h1>
    <p>Hi ${name},</p>
    <p>Your ${PUBLIC_COMPANY_NAME} account has been scheduled for deletion.</p>

    <div class="info-box" style="background: #fef3c7; border: 1px solid #f59e0b;">
      <h3 style="color: #b45309; margin-top: 0;">⚠️ Important Information</h3>
      <ul style="margin-bottom: 0;">
        <li>Your account is now deactivated</li>
        <li>You have <strong>30 days</strong> to recover your account by logging in</li>
        <li>After 30 days, all personal data will be permanently deleted</li>
        <li>Shipment history will be anonymized for business records</li>
      </ul>
    </div>

    <p>If you didn't request this deletion or want to recover your account, simply log in within the next 30 days:</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/auth/login" class="button">Recover Account</a>
    </p>

    <p>If you have any questions, please contact our support team.</p>
  `);

  return sendEmail({
    to,
    subject: `Account Deletion Scheduled - ${PUBLIC_COMPANY_NAME}`,
    html
  });
}

// Location Update Email
export async function sendLocationUpdateEmail(
  to: string,
  name: string,
  shipment: {
    trackingNumber: string;
    status: string;
    location: string;
    notes?: string | null;
  }
) {
  const html = wrapTemplate(`
    <h1>📍 Package Location Updated</h1>
    <p>Hi ${name},</p>
    <p>Your package has been tracked at a new location:</p>

    <div class="info-box">
      <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
      <p><strong>Status:</strong> ${shipment.status}</p>
      <p><strong>Current Location:</strong> ${shipment.location}</p>
      ${shipment.notes ? `<p><strong>Notes:</strong> ${shipment.notes}</p>` : ''}
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/track/${shipment.trackingNumber}" class="button">Track Package</a>
    </p>

    <p>Stay updated with your package's journey through the Caribbean!</p>
  `);

  return sendEmail({
    to,
    subject: `📍 Package Location Update - ${shipment.trackingNumber}`,
    html
  });
}

// Tracking Event Email
export async function sendTrackingEventEmail(
  to: string,
  name: string,
  shipment: {
    trackingNumber: string;
    eventType: string;
    eventDescription: string;
    location: string;
    notes?: string | null;
    estimatedDelivery?: string;
  }
) {
  const eventEmoji: Record<string, string> = {
    pickup: '📦',
    in_transit: '✈️',
    customs_clearance: '🛃',
    out_for_delivery: '🚚',
    delivery_attempt: '📬',
    delivered: '✅',
    exception: '⚠️',
    returned: '↩️',
    delayed: '⏰',
    facility_arrival: '🏢',
    facility_departure: '🚀'
  };

  const emoji = eventEmoji[shipment.eventType] || '📦';

  const html = wrapTemplate(`
    <h1>${emoji} Tracking Update</h1>
    <p>Hi ${name},</p>
    <p>There's an update on your shipment:</p>

    <div class="info-box">
      <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
      <p><strong>Event:</strong> ${shipment.eventDescription}</p>
      <p><strong>Location:</strong> ${shipment.location}</p>
      ${shipment.notes ? `<p><strong>Details:</strong> ${shipment.notes}</p>` : ''}
      ${shipment.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>` : ''}
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_SITE_URL}/track/${shipment.trackingNumber}" class="button">View Full Timeline</a>
    </p>

    <p>Thank you for shipping with ${PUBLIC_COMPANY_NAME}!</p>
  `);

  return sendEmail({
    to,
    subject: `${emoji} ${shipment.eventDescription} - ${shipment.trackingNumber}`,
    html
  });
}
