import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { sendMagicLinkEmail } from './email';

/**
 * Magic Link Service
 * Handles magic link authentication using PocketBase and Resend email
 */

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Authenticate as admin for server operations
async function authenticateAdmin() {
  const adminEmail = env.POCKETBASE_ADMIN_EMAIL || 'admin@qcs-cargo.com';
  const adminPassword = env.POCKETBASE_ADMIN_PASSWORD || 'WukYard2025#';
  
  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (error) {
    console.error('[magic-link] Failed to authenticate as admin:', error);
    throw error;
  }
}

/**
 * Generate a secure magic link token
 */
export function generateMagicLinkToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Request a magic link for login/signup
 * Creates or updates user with magic link token and sends email
 */
export async function requestMagicLink(email: string, name?: string) {
  await authenticateAdmin();
  
  try {
    // Check if user exists
    let user;
    try {
      user = await pb.collection('users').getFirstListItem(`email = "${email}"`);
    } catch (err: any) {
      // User doesn't exist, will create new one
      user = null;
    }
    
    const token = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const magicLinkUrl = `${env.PUBLIC_SITE_URL || 'http://localhost:5173'}/verify?token=${token}`;
    
    if (user) {
      // Update existing user with magic link
      await pb.collection('users').update(user.id, {
        magic_link_token: token,
        magic_link_expires: expiresAt.toISOString()
      });
    } else {
      // Create new user with magic link
      const randomPassword = generateMagicLinkToken(); // Random password (user won't use it)
      await pb.collection('users').create({
        email,
        emailVisibility: true,
        password: randomPassword,
        passwordConfirm: randomPassword,
        name: name || email.split('@')[0],
        role: 'customer',
        email_verified: false,
        magic_link_token: token,
        magic_link_expires: expiresAt.toISOString()
      });
    }
    
    // Send magic link email
    const emailResult = await sendMagicLinkEmail({
      to: email,
      name: name || user?.name || email.split('@')[0],
      magicLinkUrl,
      expiresIn: '10 minutes'
    });
    
    if (!emailResult.success) {
      throw new Error('Failed to send magic link email');
    }
    
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
  await authenticateAdmin();
  
  try {
    // Find user with valid magic link token
    const user = await pb.collection('users').getFirstListItem(
      `magic_link_token = "${token}" && magic_link_expires > "${new Date().toISOString()}"`
    );
    
    if (!user) {
      throw new Error('Invalid or expired magic link');
    }
    
    // Clear magic link token (one-time use)
    await pb.collection('users').update(user.id, {
      magic_link_token: null,
      magic_link_expires: null,
      email_verified: true,
      last_login: new Date().toISOString()
    });
    
    // Authenticate as user
    await pb.collection('users').authWithPassword(
      user.email,
      user.password // This is the random password we generated
    );
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        verified: user.email_verified
      },
      token: pb.authStore.token
    };
  } catch (error: any) {
    console.error('[magic-link] Failed to verify magic link:', error);
    throw new Error(error.message || 'Invalid or expired magic link');
  }
}

/**
 * Logout user
 */
export async function logoutUser(token: string) {
  try {
    pb.authStore.save(token);
    await pb.collection('users').authRefresh();
    pb.authStore.clear();
    return { success: true };
  } catch (error: any) {
    console.error('[magic-link] Failed to logout:', error);
    // Still return success as we want to clear local state
    return { success: true };
  }
}

/**
 * Get current user from auth token
 */
export async function getCurrentUser(token: string) {
  try {
    pb.authStore.save(token);
    const authData = await pb.collection('users').authRefresh();
    const user = authData.record;
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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
