/**
 * Offline Scanner Service
 * 
 * Provides IndexedDB storage for package scans when offline,
 * with automatic background sync when connectivity is restored.
 * 
 * @module offlineScanner
 */

import { writable, get } from 'svelte/store';

// ============================================
// Types
// ============================================

export interface OfflineScan {
  id: string;
  bookingId: string;
  packageId?: string;
  trackingNumber: string;
  actualWeight: number;
  length?: number;
  width?: number;
  height?: number;
  dimWeight?: number;
  billableWeight?: number;
  condition: 'good' | 'damaged' | 'missing_contents';
  notes?: string;
  scannedAt: string;
  scannedBy: string;
  synced: boolean;
  syncAttempts: number;
  syncError?: string;
}

export interface OfflineBooking {
  id: string;
  customer: string;
  time: string;
  packages: number;
  status: string;
  destination: string;
  cachedAt: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

// ============================================
// Stores
// ============================================

export const isOnline = writable(typeof navigator !== 'undefined' ? navigator.onLine : true);
export const pendingScans = writable<OfflineScan[]>([]);
export const syncStatus = writable<SyncStatus>('idle');
export const lastSyncTime = writable<string | null>(null);
export const syncError = writable<string | null>(null);

// ============================================
// IndexedDB Setup
// ============================================

const DB_NAME = 'qcs-offline-scanner';
const DB_VERSION = 1;
const SCANS_STORE = 'scans';
const BOOKINGS_STORE = 'bookings';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[OfflineScanner] Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[OfflineScanner] IndexedDB initialized');
      loadPendingScans();
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Scans store
      if (!database.objectStoreNames.contains(SCANS_STORE)) {
        const scansStore = database.createObjectStore(SCANS_STORE, { keyPath: 'id' });
        scansStore.createIndex('bookingId', 'bookingId', { unique: false });
        scansStore.createIndex('synced', 'synced', { unique: false });
        scansStore.createIndex('scannedAt', 'scannedAt', { unique: false });
        console.log('[OfflineScanner] Created scans store');
      }

      // Bookings cache store
      if (!database.objectStoreNames.contains(BOOKINGS_STORE)) {
        const bookingsStore = database.createObjectStore(BOOKINGS_STORE, { keyPath: 'id' });
        bookingsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        console.log('[OfflineScanner] Created bookings store');
      }
    };
  });
}

// ============================================
// Scan Operations
// ============================================

/**
 * Save a package scan to IndexedDB
 */
export async function saveScan(scan: Omit<OfflineScan, 'id' | 'synced' | 'syncAttempts'>): Promise<OfflineScan> {
  const database = await initDB();
  
  const fullScan: OfflineScan = {
    ...scan,
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    synced: false,
    syncAttempts: 0
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(SCANS_STORE);
    const request = store.add(fullScan);

    request.onsuccess = () => {
      console.log('[OfflineScanner] Scan saved:', fullScan.id);
      loadPendingScans();
      
      // Try to sync immediately if online
      if (get(isOnline)) {
        syncPendingScans();
      }
      
      resolve(fullScan);
    };

    request.onerror = () => {
      console.error('[OfflineScanner] Failed to save scan:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Load all pending (unsynced) scans from IndexedDB
 */
export async function loadPendingScans(): Promise<OfflineScan[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readonly');
    const store = transaction.objectStore(SCANS_STORE);
    const index = store.index('synced');
    const request = index.getAll(IDBKeyRange.only(false));

    request.onsuccess = () => {
      const scans = request.result as OfflineScan[];
      pendingScans.set(scans);
      console.log(`[OfflineScanner] Loaded ${scans.length} pending scans`);
      resolve(scans);
    };

    request.onerror = () => {
      console.error('[OfflineScanner] Failed to load pending scans:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get all scans (synced and unsynced)
 */
export async function getAllScans(): Promise<OfflineScan[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readonly');
    const store = transaction.objectStore(SCANS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as OfflineScan[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Mark a scan as synced
 */
export async function markScanSynced(scanId: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(SCANS_STORE);
    const getRequest = store.get(scanId);

    getRequest.onsuccess = () => {
      const scan = getRequest.result as OfflineScan;
      if (scan) {
        scan.synced = true;
        const updateRequest = store.put(scan);
        updateRequest.onsuccess = () => {
          loadPendingScans();
          resolve();
        };
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Update scan with sync error
 */
export async function markScanError(scanId: string, error: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(SCANS_STORE);
    const getRequest = store.get(scanId);

    getRequest.onsuccess = () => {
      const scan = getRequest.result as OfflineScan;
      if (scan) {
        scan.syncAttempts += 1;
        scan.syncError = error;
        const updateRequest = store.put(scan);
        updateRequest.onsuccess = () => {
          loadPendingScans();
          resolve();
        };
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Delete a scan from IndexedDB
 */
export async function deleteScan(scanId: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SCANS_STORE], 'readwrite');
    const store = transaction.objectStore(SCANS_STORE);
    const request = store.delete(scanId);

    request.onsuccess = () => {
      loadPendingScans();
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Booking Cache Operations
// ============================================

/**
 * Cache bookings for offline access
 */
export async function cacheBookings(bookings: OfflineBooking[]): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([BOOKINGS_STORE], 'readwrite');
    const store = transaction.objectStore(BOOKINGS_STORE);

    // Clear old cached bookings
    store.clear();

    // Add new bookings
    const cachedAt = new Date().toISOString();
    bookings.forEach((booking) => {
      store.add({ ...booking, cachedAt });
    });

    transaction.oncomplete = () => {
      console.log(`[OfflineScanner] Cached ${bookings.length} bookings`);
      resolve();
    };

    transaction.onerror = () => {
      console.error('[OfflineScanner] Failed to cache bookings:', transaction.error);
      reject(transaction.error);
    };
  });
}

/**
 * Get cached bookings
 */
export async function getCachedBookings(): Promise<OfflineBooking[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([BOOKINGS_STORE], 'readonly');
    const store = transaction.objectStore(BOOKINGS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as OfflineBooking[]);
    };

    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Sync Operations
// ============================================

/**
 * Sync all pending scans to the server
 */
export async function syncPendingScans(): Promise<{ synced: number; failed: number }> {
  if (!get(isOnline)) {
    console.log('[OfflineScanner] Cannot sync - offline');
    return { synced: 0, failed: 0 };
  }

  const pending = get(pendingScans);
  if (pending.length === 0) {
    console.log('[OfflineScanner] No pending scans to sync');
    return { synced: 0, failed: 0 };
  }

  syncStatus.set('syncing');
  syncError.set(null);

  let synced = 0;
  let failed = 0;

  console.log(`[OfflineScanner] Starting sync of ${pending.length} scans...`);

  for (const scan of pending) {
    // Skip scans that have failed too many times
    if (scan.syncAttempts >= 3) {
      console.warn(`[OfflineScanner] Skipping scan ${scan.id} - too many attempts`);
      failed++;
      continue;
    }

    try {
      const response = await fetch('/api/admin/packages/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: scan.bookingId,
          trackingNumber: scan.trackingNumber,
          actualWeight: scan.actualWeight,
          length: scan.length,
          width: scan.width,
          height: scan.height,
          dimWeight: scan.dimWeight,
          billableWeight: scan.billableWeight,
          condition: scan.condition,
          notes: scan.notes,
          scannedAt: scan.scannedAt,
          scannedBy: scan.scannedBy,
          offlineScanId: scan.id
        })
      });

      if (response.ok) {
        await markScanSynced(scan.id);
        synced++;
        console.log(`[OfflineScanner] Synced scan ${scan.id}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        await markScanError(scan.id, errorData.message || `HTTP ${response.status}`);
        failed++;
        console.error(`[OfflineScanner] Failed to sync scan ${scan.id}:`, errorData);
      }
    } catch (error) {
      await markScanError(scan.id, error instanceof Error ? error.message : 'Network error');
      failed++;
      console.error(`[OfflineScanner] Error syncing scan ${scan.id}:`, error);
    }
  }

  if (failed > 0) {
    syncStatus.set('error');
    syncError.set(`${failed} scan(s) failed to sync`);
  } else {
    syncStatus.set('success');
  }

  lastSyncTime.set(new Date().toISOString());

  console.log(`[OfflineScanner] Sync complete: ${synced} synced, ${failed} failed`);

  // Reset status after delay
  setTimeout(() => {
    syncStatus.set('idle');
  }, 3000);

  return { synced, failed };
}

// ============================================
// Connectivity Monitoring
// ============================================

/**
 * Initialize online/offline event listeners
 */
export function initConnectivityMonitor(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.log('[OfflineScanner] Back online');
    isOnline.set(true);
    
    // Auto-sync when coming back online
    syncPendingScans();
  };

  const handleOffline = () => {
    console.log('[OfflineScanner] Gone offline');
    isOnline.set(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Set initial state
  isOnline.set(navigator.onLine);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ============================================
// Audio Feedback
// ============================================

let successSound: HTMLAudioElement | null = null;
let errorSound: HTMLAudioElement | null = null;

/**
 * Initialize audio feedback
 */
export function initAudioFeedback(): void {
  if (typeof Audio === 'undefined') return;

  try {
    successSound = new Audio('/sounds/scan-success.mp3');
    errorSound = new Audio('/sounds/scan-error.mp3');
    
    // Preload sounds
    successSound.load();
    errorSound.load();
  } catch (error) {
    console.warn('[OfflineScanner] Could not initialize audio feedback:', error);
  }
}

/**
 * Play success sound
 */
export function playSuccessSound(): void {
  if (successSound) {
    successSound.currentTime = 0;
    successSound.play().catch(() => {});
  }
}

/**
 * Play error sound
 */
export function playErrorSound(): void {
  if (errorSound) {
    errorSound.currentTime = 0;
    errorSound.play().catch(() => {});
  }
}

// ============================================
// Haptic Feedback
// ============================================

/**
 * Trigger haptic feedback (mobile devices)
 */
export function triggerHaptic(type: 'success' | 'error' | 'warning' = 'success'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns: Record<string, number[]> = {
    success: [50],           // Short single vibration
    error: [50, 100, 50],    // Short-pause-short pattern
    warning: [100, 50, 100]  // Long-pause-long pattern
  };

  try {
    navigator.vibrate(patterns[type] || patterns.success);
  } catch (error) {
    console.warn('[OfflineScanner] Haptic feedback not available');
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a tracking number for new packages
 */
export function generateTrackingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PKG-${year}-${sequence}`;
}

/**
 * Calculate dimensional weight
 */
export function calculateDimWeight(length: number, width: number, height: number): number {
  return (length * width * height) / 166;
}

/**
 * Get billable weight (greater of actual or dimensional)
 */
export function getBillableWeight(actualWeight: number, dimWeight: number): number {
  return Math.max(actualWeight, dimWeight);
}

/**
 * Get formatted sync status message
 */
export function getSyncStatusMessage(): string {
  const status = get(syncStatus);
  const pending = get(pendingScans);
  const error = get(syncError);

  switch (status) {
    case 'syncing':
      return 'Syncing...';
    case 'error':
      return error || 'Sync failed';
    case 'success':
      return 'All scans synced!';
    default:
      if (pending.length > 0) {
        return `${pending.length} scan${pending.length > 1 ? 's' : ''} pending`;
      }
      return 'Up to date';
  }
}

// ============================================
// Export Default Object
// ============================================

export default {
  // Stores
  isOnline,
  pendingScans,
  syncStatus,
  lastSyncTime,
  syncError,
  
  // Initialization
  initDB,
  initConnectivityMonitor,
  initAudioFeedback,
  
  // Scan operations
  saveScan,
  loadPendingScans,
  getAllScans,
  markScanSynced,
  markScanError,
  deleteScan,
  
  // Booking cache
  cacheBookings,
  getCachedBookings,
  
  // Sync
  syncPendingScans,
  
  // Feedback
  playSuccessSound,
  playErrorSound,
  triggerHaptic,
  
  // Utilities
  generateTrackingNumber,
  calculateDimWeight,
  getBillableWeight,
  getSyncStatusMessage
};


