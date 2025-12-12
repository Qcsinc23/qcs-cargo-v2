import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from '$env/static/private';

// Server-side PocketBase instance with admin authentication
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Auto-authenticate as admin on server
async function authenticateAdmin() {
  try {
    await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
  } catch (error) {
    console.error('Failed to authenticate with PocketBase admin:', error);
    throw error;
  }
}

// Authenticate immediately when module is imported
authenticateAdmin();

// Helper function to ensure admin authentication is valid
export async function ensureAdminAuth() {
  if (!pb.authStore.isValid || !pb.authStore.isAdmin) {
    await authenticateAdmin();
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