import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { CalculationBreakdown } from '$lib/types/calculator';

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
  serviceType: 'standard' | 'express' | 'door-to-door' | 'consolidated' | null;
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
  // BUG FIX: Use crypto.randomUUID() only; Math.random() is not cryptographically secure
  // In environments where crypto is not available (e.g., older browsers),
  // this should fail gracefully rather than using weak random values
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : (() => {
    throw new Error('crypto.randomUUID() is not available in this environment');
  })(),
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
        try {
          const parsed = JSON.parse(stored);
          // Check if draft is less than 24 hours old
          const lastUpdated = new Date(parsed.lastUpdated);
          const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate < 24) {
            // Validate parsed state has required fields
            if (parsed && typeof parsed === 'object' && 'packages' in parsed && Array.isArray(parsed.packages)) {
              storedState = { ...initialState, ...parsed };
            } else {
              // Invalid state, discard and use initial state
              console.warn('[Booking Store] Invalid draft state, using initial state');
              localStorage.removeItem(STORAGE_KEY);
              storedState = initialState;
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (parseError) {
          console.error('[Booking Store] Failed to parse stored state:', parseError);
          localStorage.removeItem(STORAGE_KEY);
          storedState = initialState;
        }
      }
    } catch (e) {
      console.error('[Booking Store] Failed to load state:', e);
    }
  }

  const { subscribe, set, update } = writable<BookingState>(storedState);

  // Persist to localStorage on changes with debouncing
  if (browser) {
    let timeoutId: ReturnType<typeof setTimeout> | null;
    
    subscribe((state) => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Debounce writes to avoid excessive localStorage operations
      timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...state,
            lastUpdated: new Date().toISOString()
          }));
        } catch (e) {
          console.error('[Booking Store] Failed to save state:', e);
        }
        timeoutId = null;
      }, 300); // 300ms debounce
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
      serviceType?: BookingState['serviceType'];
      /** snake_case variant from DB */
      service_type?: 'standard' | 'express' | 'door_to_door' | 'consolidated' | null;
      destination?: string;
      recipient?: BookingRecipient;
      default_packages?: BookingPackage[];
    }) {
      // Transform service type from database format (snake_case) to frontend format (kebab-case)
      const rawServiceType = template.service_type ?? template.serviceType ?? null;
      const frontendServiceType: BookingState['serviceType'] =
        rawServiceType === 'door_to_door' ? 'door-to-door' : (rawServiceType as BookingState['serviceType']);

      update((state) => ({
        ...state,
        templateId: template.id,
        serviceType: frontendServiceType,
        destination: template.destination || state.destination,
        recipient: template.recipient || null,
        packages: template.default_packages || [createEmptyPackage()]
      }));
    },

    // Initialize from calculator result
    initFromCalculatorResult(
      result: CalculationBreakdown, 
      destination: string, 
      serviceType: string,
      dimensions?: { length: number | null; width: number | null; height: number | null }
    ) {
      const pkg: BookingPackage = {
        ...createEmptyPackage(),
        weight: result.actualWeight,
        length: dimensions?.length || null,
        width: dimensions?.width || null,
        height: dimensions?.height || null,
        dimensionsUnknown: !dimensions?.length,
        declaredValue: result.declaredValue || null,
      };

      const quote: BookingQuote = {
        packages: [{
          id: pkg.id,
          weight: result.actualWeight,
          dimWeight: result.dimensionalWeight || 0,
          billableWeight: result.billableWeight,
          cost: result.baseCost + result.expressFee + result.handlingFee + result.doorToDoorFee
        }],
        subtotal: result.subtotal,
        multiPackageDiscount: 0,
        insuranceCost: result.insuranceFee,
        totalCost: result.total,
        transitDays: result.estimatedDelivery
      };

      const mappedServiceType = serviceType === 'door_to_door' ? 'door-to-door' : (serviceType as any);

      set({
        ...initialState,
        step: 2, // Start at package details
        serviceType: mappedServiceType,
        destination,
        packages: [pkg],
        quote,
        lastUpdated: new Date().toISOString()
      });
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
          // Validate destination is from configured list
          if (!state.destination) return false;
          // Import DESTINATIONS dynamically to avoid circular dependency
          // This is a runtime check; destination should also be validated on server
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
