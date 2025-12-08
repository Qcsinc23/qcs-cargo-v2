// Pricing Constants
export const PRICING = {
  MIN_CHARGE: 15.00,
  DIM_WEIGHT_DIVISOR: 166, // cubic inches per lb
  INSURANCE_RATE: 0.02, // 2% of declared value
  MIN_INSURANCE: 5.00,
  PICKUP_FEE_NJ: 25.00,
  CUSTOMS_CLEARANCE_FEE: 35.00,
  CANCELLATION_FEE: 15.00,
  VOLUME_DISCOUNTS: [
    { minWeight: 100, discount: 0.05 },  // 5% off for 100+ lbs
    { minWeight: 500, discount: 0.10 },  // 10% off for 500+ lbs
    { minWeight: 1000, discount: 0.15 }  // 15% off for 1000+ lbs
  ],
  MULTI_PACKAGE_DISCOUNT: 0.05 // 5% off for 3+ packages
} as const;

// Booking Constants
export const BOOKING = {
  MIN_ADVANCE_HOURS: 24,
  MAX_ADVANCE_DAYS: 30,
  MAX_PACKAGES_PER_BOOKING: 20,
  MAX_WEIGHT_PER_PACKAGE: 150, // lbs
  MAX_TOTAL_WEIGHT: 2000, // lbs per booking
  MAX_BOOKINGS_PER_SLOT: 10,
  FREE_MODIFICATION_HOURS: 24,
  FREE_CANCELLATION_HOURS: 12,
  WEIGHT_DISCREPANCY_THRESHOLD: 0.10 // 10% variance
} as const;

// Time Slots
export const TIME_SLOTS = {
  weekday: [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00'
  ],
  saturday: [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00'
  ],
  sunday: [] // Closed
} as const;

// Status Mappings
export const PACKAGE_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  received: { label: 'Received', color: 'default' },
  processing: { label: 'Processing', color: 'default' },
  in_transit: { label: 'In Transit', color: 'secondary' },
  customs: { label: 'Customs', color: 'secondary' },
  out_for_delivery: { label: 'Out for Delivery', color: 'secondary' },
  delivered: { label: 'Delivered', color: 'success' },
  exception: { label: 'Exception', color: 'destructive' },
  cancelled: { label: 'Cancelled', color: 'destructive' }
} as const;

export const BOOKING_STATUSES = {
  pending_payment: { label: 'Pending Payment', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  checked_in: { label: 'Checked In', color: 'secondary' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
  no_show: { label: 'No Show', color: 'destructive' }
} as const;

// Company Info
export const COMPANY = {
  name: 'QCS Cargo',
  phone: '201-249-0929',
  email: 'sales@quietcraftsolutions.com',
  address: {
    line1: '35 Obrien St, E12',
    city: 'Kearny',
    state: 'NJ',
    zip: '07032',
    country: 'USA'
  },
  hours: {
    weekday: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 2:00 PM',
    sunday: 'Closed'
  }
} as const;

