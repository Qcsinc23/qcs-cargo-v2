import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// ===========================================
// TYPES
// ===========================================

export interface BookingPackage {
  id: string;
  weight: number | null;
  weightUnknown: boolean;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionsUnknown: boolean;
  declaredValue: number | null;
  contentsDescription: string;
  specialInstructions: string;
}

export interface BookingRecipient {
  id?: string; // If selecting saved recipient
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  destination: string;
  deliveryInstructions: string;
  saveForFuture: boolean;
}

export interface PackageQuote {
  id: string;
  weight: number;
  dimWeight: number;
  billableWeight: number;
  cost: number;
}

export interface BookingQuote {
  packages: PackageQuote[];
  subtotal: number;
  multiPackageDiscount: number;
  insuranceCost: number;
  totalCost: number;
  transitDays: string;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  
  // Step 1: Service & Destination
  serviceType: 'standard' | 'express' | 'door_to_door' | 'consolidated' | null;
  destination: string | null;
  
  // Step 2: Packages (multi-package support)
  packages: BookingPackage[];
  
  // Step 3: Recipient
  recipient: BookingRecipient | null;
  customsDocuments: string[]; // File names for persistence (actual files in separate state)
  
  // Step 4: Schedule
  scheduledDate: string | null;
  timeSlot: string | null;
  
  // Step 5: Review/Payment
  quote: BookingQuote | null;
  
  // Payment
  paymentIntentId: string | null;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | null;
  paymentError: string | null;
  
  // Metadata
  templateId: string | null;
  lastUpdated: string;
}

// ===========================================
// HELPERS
// ===========================================

export const createEmptyPackage = (): BookingPackage => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
  weight: null,
  weightUnknown: false,
  length: null,
  width: null,
  height: null,
  dimensionsUnknown: false,
  declaredValue: null,
  contentsDescription: '',
  specialInstructions: ''
});

const initialState: BookingState = {
  step: 1,
  serviceType: null,
  destination: null,
  packages: [createEmptyPackage()],
  recipient: null,
  customsDocuments: [],
  scheduledDate: null,
  timeSlot: null,
  quote: null,
  paymentIntentId: null,
  paymentStatus: null,
  paymentError: null,
  templateId: null,
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'qcs_booking_draft';

// ===========================================
// STORE
// ===========================================

function createBookingStore() {
  let storedState = initialState;
  
  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if draft is less than 24 hours old
        const lastUpdated = new Date(parsed.lastUpdated);
        const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          storedState = { ...initialState, ...parsed };
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('[Booking Store] Failed to load state:', e);
    }
  }

  const { subscribe, set, update } = writable<BookingState>(storedState);

  // Persist to localStorage on changes
  if (browser) {
    subscribe((state) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[Booking Store] Failed to save state:', e);
      }
    });
  }

  return {
    subscribe,

    // Navigation
    nextStep() {
      update((state) => ({
        ...state,
        step: Math.min(state.step + 1, 5) as 1 | 2 | 3 | 4 | 5
      }));
    },

    prevStep() {
      update((state) => ({
        ...state,
        step: Math.max(state.step - 1, 1) as 1 | 2 | 3 | 4 | 5
      }));
    },

    goToStep(step: 1 | 2 | 3 | 4 | 5) {
      update((state) => ({ ...state, step }));
    },

    // Step 1: Service & Destination
    setService(serviceType: BookingState['serviceType']) {
      update((state) => ({ ...state, serviceType }));
    },

    setDestination(destination: string) {
      update((state) => ({ ...state, destination }));
    },

    // Step 2: Packages
    addPackage() {
      update((state) => ({
        ...state,
        packages: [...state.packages, createEmptyPackage()]
      }));
    },

    removePackage(packageId: string) {
      update((state) => ({
        ...state,
        packages: state.packages.length > 1 
          ? state.packages.filter(p => p.id !== packageId)
          : state.packages
      }));
    },

    updatePackage(packageId: string, data: Partial<BookingPackage>) {
      update((state) => ({
        ...state,
        packages: state.packages.map(p =>
          p.id === packageId ? { ...p, ...data } : p
        )
      }));
    },

    // Step 3: Recipient
    setRecipient(recipient: BookingRecipient) {
      update((state) => ({ ...state, recipient }));
    },

    selectSavedRecipient(recipientId: string, recipientData: Omit<BookingRecipient, 'id'>) {
      update((state) => ({
        ...state,
        recipient: { ...recipientData, id: recipientId, saveForFuture: false }
      }));
    },

    addCustomsDocument(fileName: string) {
      update((state) => ({
        ...state,
        customsDocuments: [...state.customsDocuments, fileName]
      }));
    },

    removeCustomsDocument(index: number) {
      update((state) => ({
        ...state,
        customsDocuments: state.customsDocuments.filter((_, i) => i !== index)
      }));
    },

    // Step 4: Schedule
    setSchedule(scheduledDate: string, timeSlot: string) {
      update((state) => ({ ...state, scheduledDate, timeSlot }));
    },

    // Quote
    setQuote(quote: BookingQuote | null) {
      update((state) => ({ ...state, quote }));
    },

    // Payment
    setPaymentIntent(paymentIntentId: string) {
      update((state) => ({
        ...state,
        paymentIntentId,
        paymentStatus: 'pending',
        paymentError: null
      }));
    },

    setPaymentStatus(status: BookingState['paymentStatus'], error?: string) {
      update((state) => ({
        ...state,
        paymentStatus: status,
        paymentError: error || null
      }));
    },

    // Templates
    loadTemplate(template: {
      id: string;
      service_type: BookingState['serviceType'];
      destination?: string;
      recipient?: BookingRecipient;
      default_packages?: BookingPackage[];
    }) {
      update((state) => ({
        ...state,
        templateId: template.id,
        serviceType: template.service_type,
        destination: template.destination || state.destination,
        recipient: template.recipient || null,
        packages: template.default_packages || [createEmptyPackage()]
      }));
    },

    // Reset
    reset() {
      set({
        ...initialState,
        packages: [createEmptyPackage()],
        lastUpdated: new Date().toISOString()
      });
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    // Check if draft exists
    hasDraft(): boolean {
      const state = get({ subscribe });
      return state.step > 1 || state.serviceType !== null;
    },

    // Validation
    canProceedToStep(targetStep: number): boolean {
      const state = get({ subscribe });
      
      switch (targetStep) {
        case 2:
          return !!state.serviceType && !!state.destination;
        case 3:
          return state.packages.length > 0 && state.packages.every(p =>
            (p.weight !== null && p.weight > 0) || p.weightUnknown
          );
        case 4:
          return state.recipient !== null && 
                 !!state.recipient.name &&
                 !!state.recipient.phone &&
                 !!state.recipient.addressLine1 &&
                 !!state.recipient.city;
        case 5:
          return !!state.scheduledDate && !!state.timeSlot;
        default:
          return true;
      }
    },

    // Get current state
    getState(): BookingState {
      return get({ subscribe });
    }
  };
}

export const booking = createBookingStore();

// Derived stores
export const currentStep = derived(booking, $b => $b.step);
export const packageCount = derived(booking, $b => $b.packages.length);
export const hasMultiplePackages = derived(booking, $b => $b.packages.length > 1);
export const hasDraft = derived(booking, $b => $b.step > 1 || $b.serviceType !== null);
export const selectedDestination = derived(booking, $b => $b.destination);
export const selectedService = derived(booking, $b => $b.serviceType);

// Calculate total estimated weight
export const totalWeight = derived(booking, $b => {
  return $b.packages.reduce((sum, pkg) => {
    if (pkg.weightUnknown) return sum;
    return sum + (pkg.weight || 0);
  }, 0);
});

// Check if any packages have unknown weight
export const hasUnknownWeight = derived(booking, $b => {
  return $b.packages.some(pkg => pkg.weightUnknown);
});

