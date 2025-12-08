// Company Information
export const COMPANY = {
  name: 'QCS Cargo',
  fullName: 'Quiet Craft Solutions Cargo',
  phone: '201-249-0929',
  email: 'sales@quietcraftsolutions.com',
  supportEmail: 'support@quietcraftsolutions.com',
  address: {
    street: '35 Obrien St, E12',
    city: 'Kearny',
    state: 'NJ',
    zip: '07032',
    country: 'USA'
  },
  fullAddress: '35 Obrien St, E12, Kearny, NJ 07032',
  coordinates: {
    lat: 40.7676,
    lng: -74.1502
  },
  hours: {
    weekday: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 2:00 PM',
    sunday: 'Closed'
  },
  social: {
    facebook: 'https://facebook.com/qcscargo',
    instagram: 'https://instagram.com/qcscargo',
    whatsapp: '+1-201-249-0929'
  }
};

// Trust Signals
export const TRUST_SIGNALS = [
  { label: 'Years Experience', value: '15+' },
  { label: 'Packages Delivered', value: '50,000+' },
  { label: 'Customer Satisfaction', value: '99%' },
  { label: 'TSA Licensed', value: '✓' }
];

// Services (for display/marketing purposes)
export const SERVICES_INFO = [
  {
    id: 'standard',
    name: 'Standard Air Freight',
    description: 'Fixed weekly departures with real-time tracking',
    features: ['Competitive bulk rates', 'Professional handling', 'Insurance options'],
    startingPrice: 3.50,
    transitTime: '3-5 business days',
    icon: 'package'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Urgent shipments with priority processing',
    features: ['Same-day processing', 'Priority customs clearance', 'Next-flight guarantee'],
    startingPrice: null,
    priceNote: '+25% over standard',
    transitTime: '1-2 business days',
    icon: 'zap'
  },
  {
    id: 'door-to-door',
    name: 'Door-to-Door Service',
    description: 'Complete logistics from pickup to final delivery',
    features: ['Free pickup in NJ area', 'Last-mile delivery', 'Signature confirmation'],
    startingPrice: 25,
    priceNote: 'pickup fee + shipping',
    transitTime: '3-5 business days',
    icon: 'truck'
  },
  {
    id: 'consolidated',
    name: 'Consolidated Cargo',
    description: 'Cost-effective option for multiple packages',
    features: ['Volume discounts', 'Secure consolidation', 'Weekly consolidation windows'],
    startingPrice: null,
    priceNote: 'Save up to 30%',
    transitTime: '3-5 business days',
    icon: 'layers'
  }
];

// Process Steps
export const PROCESS_STEPS = [
  {
    number: 1,
    title: 'Get a Quote',
    description: 'Use our calculator for instant pricing based on weight and destination'
  },
  {
    number: 2,
    title: 'Book Online',
    description: 'Schedule your drop-off time and provide package details'
  },
  {
    number: 3,
    title: 'Drop Off',
    description: 'Bring packages to our warehouse during your scheduled time'
  },
  {
    number: 4,
    title: 'Track & Receive',
    description: 'Follow your shipment in real-time until delivery'
  }
];

// Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Maria G.',
    location: 'Newark, NJ',
    destination: 'Guyana',
    rating: 5,
    text: 'I\'ve been shipping barrels to my family in Guyana for over 5 years with QCS. They\'re always reliable and my packages arrive safely. The tracking feature gives me peace of mind.',
    avatar: null
  },
  {
    id: 2,
    name: 'Devon T.',
    location: 'Jersey City, NJ',
    destination: 'Jamaica',
    rating: 5,
    text: 'As a small business owner, I need reliable shipping for my products. QCS Cargo has never let me down. Great rates and excellent customer service.',
    avatar: null
  },
  {
    id: 3,
    name: 'Patricia W.',
    location: 'Elizabeth, NJ',
    destination: 'Trinidad',
    rating: 5,
    text: 'The online booking system is so easy to use! I can schedule drop-offs around my busy schedule and track everything from my phone.',
    avatar: null
  }
];

// FAQ Categories
export const FAQ_CATEGORIES = [
  {
    id: 'shipping',
    name: 'Shipping & Rates',
    icon: 'package'
  },
  {
    id: 'tracking',
    name: 'Tracking & Delivery',
    icon: 'map-pin'
  },
  {
    id: 'prohibited',
    name: 'Prohibited Items',
    icon: 'alert-triangle'
  },
  {
    id: 'payment',
    name: 'Payment & Billing',
    icon: 'credit-card'
  },
  {
    id: 'customs',
    name: 'Customs & Documentation',
    icon: 'file-text'
  }
];

// FAQs
export const FAQS = [
  {
    id: 1,
    category: 'shipping',
    question: 'What are your shipping rates?',
    answer: 'Our rates start at $3.50/lb for standard air freight to Guyana and Trinidad, $3.75/lb to Jamaica, $4.00/lb to Barbados, and $4.25/lb to Suriname. Volume discounts are available for shipments over 100 lbs.'
  },
  {
    id: 2,
    category: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Standard air freight takes 3-5 business days. Express service delivers in 1-2 business days. Transit times may vary based on customs clearance.'
  },
  {
    id: 3,
    category: 'shipping',
    question: 'What is dimensional weight?',
    answer: 'Dimensional weight is calculated as (Length × Width × Height) ÷ 166. We charge based on the greater of actual weight or dimensional weight.'
  },
  {
    id: 4,
    category: 'tracking',
    question: 'How do I track my shipment?',
    answer: 'Enter your tracking number on our tracking page or log into your account to see real-time updates. You\'ll also receive email/SMS notifications at each stage.'
  },
  {
    id: 5,
    category: 'tracking',
    question: 'What do the tracking statuses mean?',
    answer: 'Received: We have your package. Processing: Being prepared for shipment. In Transit: On the way to destination. Customs: Going through customs clearance. Delivered: Successfully delivered.'
  },
  {
    id: 6,
    category: 'prohibited',
    question: 'What items are prohibited?',
    answer: 'Prohibited items include: explosives, firearms, illegal drugs, flammable liquids, live animals, and currency. Some items like batteries and perfumes have restrictions - check our prohibited items page for details.'
  },
  {
    id: 7,
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. Payment is required at the time of booking.'
  },
  {
    id: 8,
    category: 'customs',
    question: 'Do I need to fill out customs forms?',
    answer: 'We handle all customs documentation for you. You\'ll need to provide accurate descriptions and values for your items. Commercial shipments may require additional documentation.'
  }
];

// Time slots
export const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
];

export const SATURDAY_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00'
];

// Status colors
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  received: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  processing: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  in_transit: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  customs: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  out_for_delivery: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  exception: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  received: 'Received',
  processing: 'Processing',
  in_transit: 'In Transit',
  customs: 'Customs Clearance',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  exception: 'Exception'
};
