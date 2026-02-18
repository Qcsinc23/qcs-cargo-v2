import PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';
import { randomBytes } from 'crypto';
import { PUBLIC_POCKETBASE_URL, PUBLIC_SITE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { sendMagicLinkEmail } from './email';
import { escapePbFilterValue } from '$lib/server/pb-filter';

/**
 * Magic Link Service
 * Handles magic link authentication using PocketBase and Resend email
 */

/**
 * Extended User record type with custom fields
 */
interface UserRecord extends RecordModel {
  email: string;
  name: string;
  role: string;
  avatar: string;
  email_verified: boolean;
  phone: string;
  stripe_customer_id: string;
  magic_link_token: string | null;
  magic_link_expires: string | null;
  password?: string;
}

const POCKETBASE_URL = PUBLIC_POCKETBASE_URL;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Helper to get an authenticated admin PocketBase instance
async function getAdminPB() {
  const pb = new PocketBase(POCKETBASE_URL);
  const adminEmail = env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PocketBase admin credentials not configured (POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD)');
  }
  
  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    return pb;
  } catch (error) {
    console.error('[magic-link] Failed to authenticate as admin:', error);
    throw error;
  }
}

/**
 * Generate a secure magic link token
 */
export function generateMagicLinkToken(): string {
  return randomBytes(32).toString('hex');
}

async function findUserByEmailCaseInsensitive(
  pb: PocketBase,
  normalizedEmail: string
): Promise<UserRecord | null> {
  const escapedEmail = escapePbFilterValue(normalizedEmail);

  const exactMatch = await pb
    .collection('users')
    .getFirstListItem<UserRecord>(`email = "${escapedEmail}"`)
    .catch(() => null);

  if (exactMatch) {
    return exactMatch;
  }

  const users = await pb.collection('users').getFullList<UserRecord>({
    fields:
      'id,email,name,role,avatar,email_verified,phone,stripe_customer_id,magic_link_token,magic_link_expires'
  });

  return (
    users.find((candidate) => normalizeEmail(String(candidate.email || '')) === normalizedEmail) ||
    null
  );
}

/**
 * Request a magic link for login/signup
 * Creates or updates user with magic link token and sends email
 */
export async function requestMagicLink(email: string, name?: string, redirectTo?: string) {
  const pb = await getAdminPB();
  const normalizedEmail = normalizeEmail(email);
  
  try {
    console.log(`[magic-link] Requesting magic link for ${normalizedEmail}`);
    
    // Check if user exists (case-insensitive to prevent duplicate accounts)
    let user = await findUserByEmailCaseInsensitive(pb, normalizedEmail);
    if (user) {
      console.log(`[magic-link] Found existing user: ${user.id}`);
      if (user.email !== normalizedEmail) {
        try {
          await pb.collection('users').update(user.id, { email: normalizedEmail });
          user = { ...user, email: normalizedEmail };
        } catch (canonicalizeErr) {
          console.warn(
            `[magic-link] Failed to canonicalize user email for ${user.id}:`,
            canonicalizeErr
          );
        }
      }
    } else {
      // User doesn't exist, will create new one
      console.log(`[magic-link] User ${normalizedEmail} not found, will create new one`);
    }
    
    const token = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Include redirectTo in the magic link URL if provided
    let magicLinkUrl = `${PUBLIC_SITE_URL}/verify?token=${token}`;
    if (redirectTo) {
      magicLinkUrl += `&redirectTo=${encodeURIComponent(redirectTo)}`;
    }
    
    // PocketBase friendly date string (YYYY-MM-DD HH:MM:SS)
    const pbExpiresAt = expiresAt.toISOString().replace('T', ' ').replace('Z', '');
    
    if (user) {
      // Update existing user with magic link
      await pb.collection('users').update(user.id, {
        magic_link_token: token,
        magic_link_expires: pbExpiresAt
      });
      console.log(`[magic-link] Updated user ${user.id} with new token`);
    } else {
      // Create new user with magic link
      const randomPassword = generateMagicLinkToken(); // Random password (user won't use it)
      const newUser = await pb.collection('users').create({
        email: normalizedEmail,
        emailVisibility: true,
        password: randomPassword,
        passwordConfirm: randomPassword,
        name: name || normalizedEmail.split('@')[0],
        role: 'customer',
        email_verified: false,
        magic_link_token: token,
        magic_link_expires: pbExpiresAt
      });
      console.log(`[magic-link] Created new user: ${newUser.id}`);
    }
    
    // Send magic link email
    console.log(`[magic-link] Sending email to ${normalizedEmail}`);
    const emailResult = await sendMagicLinkEmail({
      to: normalizedEmail,
      name: name || user?.name || normalizedEmail.split('@')[0],
      magicLinkUrl,
      expiresIn: '10 minutes'
    });
    
    if (!emailResult.success) {
      throw new Error('Failed to send magic link email');
    }
    
    console.log(`[magic-link] Magic link sent successfully to ${normalizedEmail}`);
    
    return {
      success: true,
      message: 'Magic link sent to your email',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error: any) {
    console.error('[magic-link] Failed to request magic link:', error);
    throw new Error(error.message || 'Failed to request magic link');
  }
}

/**
 * Verify a magic link token
 * Validates token and creates session
 */
export async function verifyMagicLink(token: string) {
  const pb = await getAdminPB();
  
  try {
    console.log(`[magic-link] Verifying token: ${token.substring(0, 8)}...`);
    
    // PocketBase friendly now string
    const pbNow = new Date().toISOString().replace('T', ' ').replace('Z', '');
    
    // Find user with valid magic link token
    let user: UserRecord;
    try {
      user = await pb.collection('users').getFirstListItem<UserRecord>(
        `magic_link_token = "${token}" && magic_link_expires > "${pbNow}"`
      );
    } catch (err: any) {
      console.error(`[magic-link] Token verification failed: ${err.message}`);
      throw new Error('Invalid or expired magic link');
    }
    
    console.log(`[magic-link] Found user for token: ${user.id} (${user.email})`);
    
    // Generate a new random password for authentication
    const newPassword = generateMagicLinkToken();
    
    // Clear magic link token and set new password
    await pb.collection('users').update(user.id, {
      magic_link_token: '',
      magic_link_expires: '',
      email_verified: true,
      last_login: new Date().toISOString().replace('T', ' ').replace('Z', ''),
      password: newPassword,
      passwordConfirm: newPassword
    });
    
    console.log(`[magic-link] Updated user password and cleared token for ${user.id}`);
    
    // Create a NEW pb instance for user authentication to avoid state pollution
    const userPb = new PocketBase(POCKETBASE_URL);
    const authData = await userPb.collection('users').authWithPassword(
      user.email,
      newPassword
    );
    
    console.log(`[magic-link] Successfully authenticated as user ${user.id}`);
    
    return {
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        role: (authData.record as UserRecord).role || 'customer',
        avatar: (authData.record as UserRecord).avatar,
        verified: (authData.record as UserRecord).email_verified
      },
      token: userPb.authStore.token
    };
  } catch (error: any) {
    console.error('[magic-link] Failed to verify magic link:', error);
    throw error; // Re-throw the error as is
  }
}

/**
 * Logout user
 */
export async function logoutUser(token: string) {
  try {
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token);
    await pb.collection('users').authRefresh();
    pb.authStore.clear();
    return { success: true };
  } catch (error: any) {
    console.error('[magic-link] Failed to logout:', error);
    return { success: true };
  }
}

/**
 * Get current user from auth token
 */
export async function getCurrentUser(token: string) {
  try {
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token);
    const authData = await pb.collection('users').authRefresh();
    const user = authData.record as UserRecord;
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        avatar: user.avatar,
        verified: user.email_verified,
        phone: user.phone,
        stripe_customer_id: user.stripe_customer_id,
        created: user.created,
        updated: user.updated
      }
    };
  } catch (error: any) {
    console.error('[magic-link] Failed to get current user:', error);
    return {
      success: false,
      user: null
    };
  }
}
