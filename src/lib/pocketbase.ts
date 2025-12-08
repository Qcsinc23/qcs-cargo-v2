import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { browser } from '$app/environment';

// Client-side PocketBase instance
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Disable auto-cancellation on client
if (browser) {
  pb.autoCancellation(false);
}

// Type-safe helper for getting file URLs
export function getFileUrl(
  record: { id: string; collectionId: string; collectionName: string },
  filename: string,
  options?: { thumb?: string }
): string {
  return pb.files.getUrl(record, filename, options);
}