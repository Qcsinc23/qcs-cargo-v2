import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

// Server-side PocketBase instance with admin authentication
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Auto-authenticate as admin on server (lazy initialization)
let adminAuthPromise: Promise<void> | null = null;

async function authenticateAdmin() {
  const email = env.POCKETBASE_ADMIN_EMAIL;
  const password = env.POCKETBASE_ADMIN_PASSWORD;
  
  if (!email || !password) {
    console.warn('PocketBase admin credentials not configured - admin auth will be skipped');
    return;
  }
  
  try {
    await pb.admins.authWithPassword(email, password);
  } catch (error) {
    console.error('Failed to authenticate with PocketBase admin:', error);
    throw error;
  }
}

// Helper function to ensure admin authentication is valid
export async function ensureAdminAuth() {
  if (!adminAuthPromise) {
    adminAuthPromise = authenticateAdmin();
  }
  await adminAuthPromise;
  
  // Re-authenticate if expired
  if (!pb.authStore.isValid || !pb.authStore.isAdmin) {
    adminAuthPromise = authenticateAdmin();
    await adminAuthPromise;
  }
}

// Export getFileUrl for consistency with client
export function getFileUrl(
  record: { id: string; collectionId: string; collectionName: string },
  filename: string,
  options?: { thumb?: string }
): string {
  return pb.files.getUrl(record, filename, options);
}