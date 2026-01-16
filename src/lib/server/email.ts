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
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #1a202c; 
    margin: 0; 
    padding: 0;
    -webkit-font-smoothing: antialiased;
    background-color: #f7fafc;
  }
  .wrapper {
    background-color: #f7fafc;
    padding: 40px 20px;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .header { 
    background-color: #023e8a;
    padding: 40px 40px;
    text-align: center;
  }
  .logo { 
    font-size: 28px; 
    font-weight: 800; 
    color: #ffffff; 
    letter-spacing: -0.02em;
    text-decoration: none;
  }
  .content { 
    padding: 48px 40px; 
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
    margin-top: 0;
    margin-bottom: 24px;
    line-height: 1.2;
  }
  p {
    margin-bottom: 20px;
    color: #4a5568;
    font-size: 16px;
  }
  .button-container {
    text-align: center;
    margin: 32px 0;
  }
  .button { 
    display: inline-block; 
    background-color: #0077b6; 
    color: #ffffff !important; 
    padding: 16px 32px; 
    border-radius: 8px; 
    text-decoration: none; 
    font-weight: 600; 
    font-size: 16px;
    transition: background-color 0.2s;
  }
  .footer { 
    padding: 32px 40px; 
    background-color: #f8fafc;
    border-top: 1px solid #edf2f7; 
    color: #718096; 
    font-size: 13px; 
    text-align: center;
  }
  .info-box { 
    background-color: #ebf8ff; 
    border-left: 4px solid #3182ce;
    padding: 16px 20px; 
    margin: 24px 0;
    border-radius: 0 4px 4px 0;
  }
  .info-box p {
    margin: 0;
    font-size: 14px;
    color: #2c5282;
  }
  .divider {
    height: 1px;
    background-color: #edf2f7;
    margin: 32px 0;
  }
  .secondary-text {
    font-size: 14px;
    color: #718096;
  }
  .link-fallback {
    word-break: break-all;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
    color: #a0aec0;
    background-color: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    margin-top: 12px;
  }
`;

function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo">📦 ${PUBLIC_COMPANY_NAME}</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="font-weight: 600; color: #4a5568; margin-bottom: 8px;">${PUBLIC_COMPANY_NAME}</p>
            <p style="margin-bottom: 4px;">Trusted Air Freight to Caribbean</p>
            <p style="margin-bottom: 16px;">35 Obrien St, E12, Kearny, NJ 07032 | 201-249-0929</p>
            <p>
              <a href="${PUBLIC_SITE_URL}" style="color: #3182ce; text-decoration: underline;">Visit our website</a>
              &nbsp;&nbsp;•&nbsp;&nbsp;
              <a href="${PUBLIC_SITE_URL}/legal/privacy" style="color: #3182ce; text-decoration: underline;">Privacy Policy</a>
            </p>
            <p style="margin-top: 24px; font-size: 11px; color: #a0aec0;">
              &copy; ${new Date().getFullYear()} ${PUBLIC_COMPANY_NAME}. All rights reserved.
            </p>
          </div>
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
    <p>Thank you for choosing ${PUBLIC_COMPANY_NAME}. We're thrilled to have you join our community of Caribbean shippers.</p>
    
    <div class="info-box">
      <p style="font-weight: 600; margin-bottom: 12px; color: #2c5282;">Get started today:</p>
      <ul style="margin: 0; padding-left: 20px; color: #2c5282; font-size: 14px;">
        <li style="margin-bottom: 8px;">Get instant shipping quotes with our smart calculator</li>
        <li style="margin-bottom: 8px;">Book shipments with easy drop-off scheduling</li>
        <li style="margin-bottom: 8px;">Track your packages in real-time from New Jersey to the Caribbean</li>
        <li style="margin-bottom: 0;">Get your own dedicated US mailbox address</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/dashboard" class="button">Access your dashboard</a>
    </div>
    
    <p>Our team is standing by to help you with your first shipment. If you have any questions, simply reply to this email or call us at 201-249-0929.</p>
    
    <div class="divider"></div>
    
    <p>Welcome aboard,<br><strong>The ${PUBLIC_COMPANY_NAME} Team</strong></p>
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
    <h1>Verify your email address</h1>
    <p>Hi ${name},</p>
    <p>Welcome to ${PUBLIC_COMPANY_NAME}. To complete your registration and secure your account, please verify your email address:</p>
    
    <div class="button-container">
      <a href="${verificationUrl}" class="button">Verify email address</a>
    </div>
    
    <p class="secondary-text">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    
    <div class="divider"></div>
    
    <p class="secondary-text">Or copy and paste this link into your browser:</p>
    <div class="link-fallback">${verificationUrl}</div>
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
    <h1>Reset your password</h1>
    <p>Hi ${name},</p>
    <p>We received a request to reset your ${PUBLIC_COMPANY_NAME} password. Click the button below to choose a new one:</p>
    
    <div class="button-container">
      <a href="${resetUrl}" class="button">Reset password</a>
    </div>
    
    <div class="info-box">
      <p><strong>Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, your password will remain unchanged.</p>
    </div>
    
    <div class="divider"></div>
    
    <p class="secondary-text">If the button doesn't work, use the link below:</p>
    <div class="link-fallback">${resetUrl}</div>
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
    <h1>Booking confirmed! ✅</h1>
    <p>Hi ${name},</p>
    <p>Your booking has been successfully created. We're looking forward to receiving your packages at our warehouse.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 16px; color: #1a202c; border-bottom: 1px solid #edf2f7; padding-bottom: 12px;">Shipment Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #718096;">Booking ID</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a202c;">${booking.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Destination</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a202c;">${booking.destination}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Drop-off Date</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a202c;">${booking.scheduledDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Time Slot</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a202c;">${booking.timeSlot}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Package Count</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a202c;">${booking.packageCount} item(s)</td>
        </tr>
        <tr style="border-top: 2px solid #edf2f7;">
          <td style="padding: 16px 0 0 0; font-weight: 700; color: #1a202c; font-size: 16px;">Total Estimate</td>
          <td style="padding: 16px 0 0 0; text-align: right; font-weight: 700; font-size: 20px; color: #0077b6;">$${booking.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    <h3 style="font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 12px;">📍 Drop-off Location</h3>
    <p style="font-size: 15px; margin-bottom: 8px;">
      <strong>QCS Cargo Warehouse</strong><br>
      35 Obrien St, E12<br>
      Kearny, NJ 07032
    </p>
    
    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/dashboard/bookings/${booking.id}" class="button">Manage booking</a>
    </div>
    
    <div class="info-box">
      <p><strong>Important:</strong> Please ensure all items are packed securely. We'll weigh and measure everything upon arrival to finalize your shipment.</p>
    </div>
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
    <h1>Shipment Update: ${emoji} ${shipment.statusDescription}</h1>
    <p>Hi ${name},</p>
    <p>There has been a change in the status of your shipment.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #718096; letter-spacing: 0.05em; margin-bottom: 8px;">Tracking Number</p>
      <p style="font-family: ui-monospace, monospace; font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 16px;">${shipment.trackingNumber}</p>
      <p style="font-size: 16px; color: #4a5568;">Current Status: <span style="font-weight: 600; color: #0077b6;">${shipment.statusDescription}</span></p>
      ${shipment.location ? `<p style="font-size: 14px; color: #718096; margin-top: 4px;">Location: ${shipment.location}</p>` : ''}
    </div>
    
    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/tracking/${shipment.trackingNumber}" class="button">Track your shipment</a>
    </div>
    
    <p class="secondary-text">Need help? Reply to this email or visit our help center.</p>
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
    <h1>Account scheduled for deletion</h1>
    <p>Hi ${name},</p>
    <p>As requested, your ${PUBLIC_COMPANY_NAME} account has been scheduled for permanent deletion.</p>

    <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #9c4221; margin-top: 0; font-size: 16px; margin-bottom: 12px;">⚠️ Important details</h3>
      <ul style="margin: 0; padding-left: 20px; color: #7b341e; font-size: 14px;">
        <li style="margin-bottom: 8px;">Your account is now deactivated.</li>
        <li style="margin-bottom: 8px;">You have <strong>30 days</strong> to recover your account by simply logging in.</li>
        <li style="margin-bottom: 8px;">After 30 days, all personal data will be permanently purged.</li>
        <li>Historical shipment records will be anonymized.</li>
      </ul>
    </div>

    <p>If you didn't request this or would like to keep your account, you can cancel the deletion by signing in now:</p>

    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/api/auth/login" class="button">Recover my account</a>
    </div>

    <p class="secondary-text">If you intended to delete your account, no further action is required.</p>
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
    <h1>📍 Package location update</h1>
    <p>Hi ${name},</p>
    <p>Your shipment has reached a new milestone in its journey.</p>

    <div style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <p style="margin-bottom: 12px;"><strong>Tracking Number:</strong> <span style="font-family: monospace;">${shipment.trackingNumber}</span></p>
      <p style="margin-bottom: 12px;"><strong>Current Location:</strong> ${shipment.location}</p>
      <p style="margin-bottom: 0;"><strong>Status:</strong> ${shipment.status}</p>
      ${shipment.notes ? `<p style="margin-top: 12px; font-style: italic; color: #718096;">Note: ${shipment.notes}</p>` : ''}
    </div>

    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/tracking/${shipment.trackingNumber}" class="button">Track package</a>
    </div>

    <p class="secondary-text">Thank you for shipping with ${PUBLIC_COMPANY_NAME}.</p>
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
    <h1>Shipment Update: ${emoji} ${shipment.eventDescription}</h1>
    <p>Hi ${name},</p>
    <p>We're writing to let you know that your shipment has a new tracking event.</p>

    <div style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #718096;">Tracking Number</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: 600;">${shipment.trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Update</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${shipment.eventDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096;">Location</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${shipment.location}</td>
        </tr>
        ${shipment.estimatedDelivery ? `
        <tr>
          <td style="padding: 8px 0; color: #718096;">Estimated Delivery</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0077b6;">${new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
        </tr>
        ` : ''}
      </table>
      ${shipment.notes ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #edf2f7; color: #718096; font-style: italic;">${shipment.notes}</div>` : ''}
    </div>

    <div class="button-container">
      <a href="${PUBLIC_SITE_URL}/tracking/${shipment.trackingNumber}" class="button">View full timeline</a>
    </div>
  `);

  return sendEmail({
    to,
    subject: `${emoji} ${shipment.eventDescription} - ${shipment.trackingNumber}`,
    html
  });
}

// Magic Link Email
export async function sendMagicLinkEmail({
  to,
  name = 'there',
  magicLinkUrl,
  expiresIn = '10 minutes'
}: {
  to: string;
  name?: string;
  magicLinkUrl: string;
  expiresIn?: string;
}) {
  const html = wrapTemplate(`
    <h1>Secure Sign-in Request</h1>
    <p>Hi ${name},</p>
    <p>We received a request to sign in to your ${PUBLIC_COMPANY_NAME} account. To complete the process, please click the button below:</p>
    
    <div class="button-container">
      <a href="${magicLinkUrl}" class="button">Sign in to your account</a>
    </div>
    
    <div class="info-box">
      <p><strong>Security Note:</strong> This link is only valid for ${expiresIn} and can be used only once. If you did not request this email, please ignore it—no changes will be made to your account.</p>
    </div>
    
    <div class="divider"></div>
    
    <p class="secondary-text">If the button above doesn't work, copy and paste this URL into your browser:</p>
    <div class="link-fallback">${magicLinkUrl}</div>
  `);

  return sendEmail({
    to,
    subject: `Your sign-in link for ${PUBLIC_COMPANY_NAME}`,
    html
  });
}
